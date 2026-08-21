import { db } from "../../config/database";
import { documentUploads } from "../../database/schema/documentUpload/document_upload.schema";
import { documentFields } from "../../database/schema/documentField/document_field.schema";
import { summary } from "../../database/schema/summary/summary.schema";
import { documentTypes } from "../../database/schema/documentType/document_type.schema";
import { eq, and } from "drizzle-orm";
import fs, { readFileSync } from "fs";
import path, { parse } from "path";
import Tesseract from "tesseract.js";
import { PDFParse } from 'pdf-parse';
import { documentParsers } from "./parsers";
import { ProductLists } from "../../database/schema/productsLists/productList.schema";
import { parseToDecimal } from "../../utils/numberHelper";
import { paarProducts } from "../../database/schema/paarProducts/paar_products.schema";

export class OcrService {
    static async processDocument(uploadId: number, workspaceId: number, documentTypeId: number, filePath: string) {
        try {
            console.log(`[OCR] Starting processing for Upload ${uploadId} - File: ${filePath}`);

            // 1. Fetch document type name
            const [docType] = await db.select().from(documentTypes).where(eq(documentTypes.id, documentTypeId));
            if (!docType) throw new Error("Invalid document type");

            const typeName = docType.documentCode.toLowerCase();
            const parser = documentParsers[typeName];

            if (!parser) {
                console.warn(`[OCR] No parser found for document type: ${typeName}`);
                await db.update(documentUploads).set({ status: 'failed' }).where(eq(documentUploads.id, uploadId));
                return;
            }

            // 2. Extract Text
            let extractedText = "";
            const ext = path.extname(filePath).toLowerCase();
            if (ext === '.pdf') {

                const dataBuffer = fs.readFileSync(filePath);

                if (typeName === "paar" || typeName == "form_m" || typeName == "sgd" || typeName == "export_assessment") {


                    const fileBuffer = readFileSync(filePath);
                    // Convert it to a Blob so it can be appended as a file
                    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });

                    const formData = new FormData()
                    formData.append('file', fileBlob, filePath)


                    const response = await fetch(`${process.env.AI_SERVICE_BASE_URL}/file_upload?doc_type=${typeName}`, {
                        method: 'POST',
                        body: formData
                    })
                    const body = await response.json();


                    // await convertPdfToImg(filePath)
                    // const data = await pdfParser.getText();
                    extractedText = body;

                } else {

                    const pdfParser = new PDFParse({ data: dataBuffer });
                    const data = await pdfParser.getText();
                    extractedText = data.text;

                }
            } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
                const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
                extractedText = text;
            } else {
                console.warn(`[OCR] Unsupported file extension ${ext}.`);
            }

            console.log(`[OCR] Extracted ${extractedText.length} characters of text for type ${typeName}.`);

            // 3. Parse with specific parser
            const parsedData = parser(extractedText);

            console.log(parsedData, "✨✨✨✨🔃🔃")

            // 4. Save extracted fields to document_fields
            const fieldsToInsert = Object.entries(parsedData)
                .filter(([_, value]) => value !== null && value !== undefined)
                .map(([fieldName, fieldValue]) => ({
                    documentId: uploadId,
                    fieldName,
                    fieldValue: typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : String(fieldValue),
                }));

            if (fieldsToInsert.length > 0) {
                await db.insert(documentFields).values(fieldsToInsert);
            }

            // 5. Match and Merge into Summary
            let matchedKey: string | null = null;
            let finalStatus = 'parsed';

            if (typeName === 'pfi' || typeName === 'fi') {
                const pfi = parsedData.pfiNumber;
                if (pfi) {
                    matchedKey = pfi;
                    const existingSummary = await db.select().from(summary).where(
                        and(eq(summary.workspaceId, workspaceId),
                            eq(summary.pfiNumber, pfi))
                    );

                    let updateData: any = {
                        updatedAt: new Date(),
                    };

                    if (typeName === 'pfi') {
                        updateData.pfiDate = parsedData?.pfiDate;
                        updateData.pfiFOB = parseToDecimal(parsedData?.pfiFOB);
                        updateData.pfiFreight = parseToDecimal(parsedData?.pfiFreight);
                        updateData.pfiTotal = parseToDecimal(parsedData?.pfiTotal);
                    } else if (typeName === 'fi') {

                        updateData.fiInvoiceNumber = parsedData?.FI_invoiceNumber;
                        updateData.fiInvoiceDate = parsedData?.FI_invoiceDate;
                        updateData.fiDuePaymentDate = parsedData?.FI_duePaymentDate;
                        updateData.fiFob = parseToDecimal(parsedData?.FI_invoiceLineItemTotal);
                        updateData.fiFreight = parseToDecimal(parsedData?.FI_freight);
                        updateData.fiTotal = parseToDecimal(parsedData?.FI_invoiceTotal);
                        updateData.fiNetWeight = parseToDecimal(parsedData?.FI_netWeight);
                        updateData.fiGrossWeight = parseToDecimal(parsedData?.FI_grossWeight);
                    }

                    if (existingSummary.length > 0) {
                        console.log(typeName, "EXISTING SUMMARY")
                        await db.update(summary).set(updateData).where(eq(summary?.id, existingSummary[0]?.id!));
                        if (typeName == "fi") {
                            console.log("UPDATING IN THE PRODUCTLIST FI VALUES")

                            console.log(parsedData?.FI_products)
                            await Promise.all(parsedData?.FI_products?.map(async (p: any) => {
                                await db.update(ProductLists).set({
                                    fi_qty: parseToDecimal(p?.qty),
                                    fi_netPrice: parseToDecimal(p?.netPrice),
                                    //fob value
                                }).where(
                                    and(eq(ProductLists.productPfiId, parsedData?.pfiNumber!),
                                        eq(ProductLists.productCode, p?.productCode!)
                                    ))
                            }))
                        } else if (typeName == "pfi") {
                            console.log("UPDATING/INSERTING IN THE PRODUCTLIST PFI VALUES")
                            await Promise.all(parsedData?.products?.map(async (p: any) => {
                                const existingProduct = await db.select().from(ProductLists).where(
                                    and(
                                        eq(ProductLists.productPfiId, parsedData?.pfiNumber!),
                                        eq(ProductLists.productCode, p.productCode)
                                    )
                                );

                                if (existingProduct.length > 0) {
                                    await db.update(ProductLists).set({
                                        productName: p.productName,
                                        pfi_qty: parseToDecimal(p.qty),
                                        pfi_netPrice: parseToDecimal(p.netPrice),
                                    }).where(eq(ProductLists.id, existingProduct[0]?.id));
                                } else {
                                    await db.insert(ProductLists).values({
                                        productPfiId: parsedData?.pfiNumber,
                                        productCode: p.productCode,
                                        productName: p.productName,
                                        pfi_qty: parseToDecimal(p.qty),
                                        pfi_netPrice: parseToDecimal(p.netPrice),
                                    });
                                }
                            }))
                        }
                    } else {
                        console.log(typeName, "NOT EXISTING SUMMARY")
                        await db.transaction(async (tx) => {
                            const [newSummary] = await tx.insert(summary).values({
                                workspaceId,
                                pfiNumber: pfi,
                                ...updateData
                            }).returning({ pficode: summary.pfiNumber });

                            if (typeName == "pfi") {
                                await Promise.all(parsedData?.products?.map(async (p: any) => {
                                    const existingProduct = await tx.select().from(ProductLists).where(
                                        and(
                                            eq(ProductLists.productPfiId, newSummary?.pficode!),
                                            eq(ProductLists.productCode, p.productCode)
                                        )
                                    );

                                    if (existingProduct.length > 0) {
                                        await tx.update(ProductLists).set({
                                            productName: p.productName,
                                            pfi_qty: parseToDecimal(p.qty),
                                            pfi_netPrice: parseToDecimal(p.netPrice),
                                        }).where(eq(ProductLists.id, existingProduct[0]?.id));
                                    } else {
                                        await tx.insert(ProductLists).values({
                                            productPfiId: newSummary?.pficode,
                                            productCode: p.productCode,
                                            productName: p.productName,
                                            pfi_qty: parseToDecimal(p.qty),
                                            pfi_netPrice: parseToDecimal(p.netPrice),
                                        });
                                    }
                                }))
                            }
                            else {
                                throw new Error("Upload PFI Before the FI.. ")
                            }
                        })
                    }
                    finalStatus = 'merged';

                    // We could trigger a re-evaluation of unmatched documents here if needed.
                } else {
                    finalStatus = 'unmatched';
                }
            } else if (['iins', 'bl', 'export_pfi'].includes(typeName)) {
                const pfi = parsedData?.pfiNumber;

                if (pfi) {
                    const existingSummary = await db.select().from(summary).where(
                        and(eq(summary.workspaceId, workspaceId), eq(summary.pfiNumber, pfi))
                    );

                    if (existingSummary.length > 0) {
                        matchedKey = pfi;
                        finalStatus = 'merged';

                        let updateData: any = { updatedAt: new Date() };
                        if (typeName === 'iins') {
                            updateData.naicomId = parsedData.naicomId;
                            updateData.iiDateOfIssue = parsedData.iiDateOfIssue;
                            updateData.iiPremiumAmount = parseToDecimal(parsedData.iiPremiumAmount);
                            updateData.iiDeclaredCertNo = parsedData.iiDeclaredCertNo;
                        } else if (typeName === 'bl') {
                            updateData.blNumber = parsedData.blReference;
                        } else if (typeName === 'export_pfi') {
                            updateData.exportEleV8Code = parsedData.exportEleV8Code;
                        }

                        await db.update(summary).set(updateData).where(eq(summary?.id, Number(existingSummary[0]?.id)));
                    } else {
                        finalStatus = 'unmatched';
                    }
                } else {
                    finalStatus = 'unmatched';
                }
            } else if (['form_m', 'paar', 'eins', 'sgd'].includes(typeName)) {
                const exportPfi = typeName == "sgd" ? parsedData?.ref_paarNumber : parsedData.refElevCode;

                console.log(exportPfi, "🙌🙌🙌🙌")

                const condition = typeName == "sgd" ? eq(summary.paarNumber, exportPfi) : eq(summary.exportEleV8Code, exportPfi)

                if (exportPfi) {
                    const existingSummary = await db.select().from(summary).where(
                        and(eq(summary.workspaceId, workspaceId), condition)
                    );

                    if (existingSummary.length > 0) {
                        matchedKey = exportPfi;
                        finalStatus = 'merged';

                        let updateData: any = { updatedAt: new Date() };
                        if (typeName === 'eins') {
                            updateData.exportInsuranceDateOfIssue = parsedData?.exportInsuranceDateOfIssue;
                            updateData.exportInsuranceDeclaredCertNo = parsedData?.exportInsuranceDeclaredCertNo;
                            updateData.exportInsurancePremiumAmount = parseToDecimal(parsedData?.exportInsurancePremiumAmount);
                        }
                        else if (typeName === 'form_m') {
                            updateData.bankApplicationNumber = parsedData.bankApplicationNumber;
                            updateData.formNumber = parsedData.formNumber;
                        } else if (typeName === 'paar') {
                            updateData.paarNumber = parsedData?.paarNumber;
                            updateData.paarIssuedDate = parsedData?.issuedDate;


                            await Promise.all(parsedData?.GoodAndServices?.map(async (item: any) => {
                                const existingProduct = await db.select().from(paarProducts).where(
                                    and(
                                        eq(paarProducts.paarNumberRef, parsedData?.paarNumber),
                                        eq(paarProducts.productName, item?.DESCRIPTIONOFGOODS)
                                    )
                                );

                                if (existingProduct.length > 0) {
                                    await db.update(paarProducts).set({
                                        productQuantity: item?.QUANTITY
                                    }).where(eq(paarProducts.id, existingProduct[0]?.id));
                                } else {
                                    await db.insert(paarProducts).values({
                                        paarNumberRef: parsedData?.paarNumber,
                                        productName: item?.DESCRIPTIONOFGOODS,
                                        productQuantity: item?.QUANTITY
                                    });
                                }
                            }))


                        } else if (typeName === 'export_assessment' || typeName === 'sgd') {
                            updateData.AssessmentNumber = parsedData?.Assessment_No;
                            updateData.AssessmentDate = parsedData?.Assessment_Date_Of_Issue;
                            updateData.dutyAmount = parseToDecimal(parsedData?.Duty_Amount);
                        }

                        await db.update(summary).set(updateData).where(eq(summary.id, existingSummary[0]?.id!));
                    } else {
                        finalStatus = 'unmatched';
                    }
                } else {
                    finalStatus = 'unmatched';

                }
            }

            // Update upload status
            await db.update(documentUploads)
                .set({
                    status: finalStatus,
                    extractedText: extractedText,
                    matchedKey: matchedKey
                })
                .where(eq(documentUploads.id, uploadId));

            console.log(`[OCR] Successfully processed Upload ${uploadId}. Status: ${finalStatus}`);

        } catch (error) {
            console.error(`[OCR] Error processing Upload ${uploadId}:`, error);
            await db.update(documentUploads)
                .set({ status: 'failed' })
                .where(eq(documentUploads.id, uploadId));
        }
    }
}
