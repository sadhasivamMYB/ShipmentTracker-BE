import { db } from "../../config/database";
import { documentUploads } from "../../database/schema/documentUpload/document_upload.schema";
import { documentFields } from "../../database/schema/documentField/document_field.schema";
import { summary } from "../../database/schema/summary/summary.schema";
import { documentTypes } from "../../database/schema/documentType/document_type.schema";
import { eq, and } from "drizzle-orm";
import fs, { readFileSync } from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import { PDFParse } from 'pdf-parse';
import { documentParsers } from "./parsers";
import { ProductLists } from "../../database/schema/productsLists/productList.schema";
import { parseToDecimal } from "../../utils/numberHelper";

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

                if (typeName === "paar" || typeName == "form_m") {


                    const fileBuffer = readFileSync(filePath);
                    // Convert it to a Blob so it can be appended as a file
                    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });

                    const formData = new FormData()
                    formData.append('file', fileBlob, filePath)


                    const response = await fetch(`https://tglushocrappqas.azurewebsites.net/api/v1/file_upload?doc_type=${typeName}`, {
                        method: 'POST',
                        body: formData
                    })
                    const body = await response.json();

                    console.log("STATUS:", response.status);
                    console.log("BODY:", body);

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
                            eq(summary.orderPfiNumber, pfi))
                    );

                    let updateData: any = {
                        updatedAt: new Date(),
                    };

                    if (typeName === 'pfi') {
                        updateData.invoiceDate = parsedData?.PfiDate;
                    } else if (typeName === 'fi') {

                        updateData.fiInvoiceNumber = parsedData?.FI_invoiceNumber;
                        updateData.fiInvoiceDate = parsedData?.FI_invoiceDate;
                        updateData.fiDuePaymentDate = parsedData?.FI_duePaymentDate;
                        updateData.fiInvoiceLineItemTotal = parseToDecimal(parsedData?.FI_invoiceLineItemTotal);
                        updateData.fiFreight = parseToDecimal(parsedData?.FI_freight);
                        updateData.fiInvoiceTotal = parseToDecimal(parsedData?.FI_invoiceTotal);
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
                        }
                    } else {
                        console.log(typeName, "NOT EXISTING SUMMARY")
                        await db.transaction(async (tx) => {
                            const [newSummary] = await tx.insert(summary).values({
                                workspaceId,
                                orderPfiNumber: pfi,
                                ...updateData
                            }).returning({ pficode: summary.orderPfiNumber });

                            if (typeName == "pfi") {
                                await Promise.all(parsedData?.products?.map(async (p: any) => {
                                    await tx.insert(ProductLists).values({
                                        productPfiId: newSummary?.pficode,
                                        productCode: p.productCode,
                                        productName: p.productName,
                                        pfi_qty: parseToDecimal(p.qty),
                                        pfi_netPrice: parseToDecimal(p.netPrice),
                                    })
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
                        and(eq(summary.workspaceId, workspaceId), eq(summary.orderPfiNumber, pfi))
                    );

                    if (existingSummary.length > 0) {
                        matchedKey = pfi;
                        finalStatus = 'merged';

                        let updateData: any = { updatedAt: new Date() };
                        if (typeName === 'iins') {
                            updateData.insuranceNaicomId = parsedData.naicomId;
                            updateData.insuranceDateOfIssue = parsedData.IIdateOfIssue;
                            updateData.insurancePremiumAmount = parseToDecimal(parsedData.IIpremiumAmount);
                            updateData.insuranceDeclaredCertNo = parsedData.IIdeclaredCertNo;
                        } else if (typeName === 'bl') {
                            updateData.blReference = parsedData.blReference;
                        } else if (typeName === 'export_pfi') {
                            updateData.exportPfiNumber = parsedData.pfiNumber;
                            updateData.eleV8Code = parsedData.eleV8Code;
                        }

                        await db.update(summary).set(updateData).where(eq(summary?.id, Number(existingSummary[0]?.id)));
                    } else {
                        finalStatus = 'unmatched';
                    }
                } else {
                    finalStatus = 'unmatched';
                }
            } else if (['form_m', 'paar', 'eins', 'export_assessment'].includes(typeName)) {
                const exportPfi = parsedData.refElevCode;
                if (exportPfi) {
                    const existingSummary = await db.select().from(summary).where(
                        and(eq(summary.workspaceId, workspaceId), eq(summary.eleV8Code, exportPfi))
                    );

                    if (existingSummary.length > 0) {
                        matchedKey = exportPfi;
                        finalStatus = 'merged';

                        let updateData: any = { updatedAt: new Date() };
                        if (typeName === 'eins') {
                            updateData.exportInsuranceDateOfIssue = parsedData?.EIdateOfIssue;
                            updateData.exportInsuranceDeclaredCertNo = parsedData?.EIdeclaredCertNo;
                            updateData.exportInsurancePremiumAmount = parseToDecimal(parsedData?.EIpremiumAmount);
                        }
                        else if (typeName === 'form_m') {
                            updateData.baNumber = parsedData.baNumber;
                            updateData.formNumber = parsedData.formNumber;
                        } else if (typeName === 'paar') {
                            updateData.paarNumber = parsedData.paarNumber;
                        } else if (typeName === 'export_assessment') {
                            updateData.exportAssessmentAmount = parseToDecimal(parsedData.exportAssessmentAmount);
                            updateData.exportAssessmentCno = parsedData.exportAssessmentCno;
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
