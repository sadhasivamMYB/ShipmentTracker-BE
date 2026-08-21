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
import { paarProducts } from "../../database/schema/paarProducts/paar_products.schema";

export class OcrService {
    static async processAndValidate(workspaceId: number, documentTypeId: number, filePath: string) {
        console.log(`[OCR] Starting validation for file: ${filePath}`);

        // 1. Fetch document type name
        const [docType] = await db.select().from(documentTypes).where(eq(documentTypes.id, documentTypeId));
        if (!docType) throw new Error("Invalid document type");

        const typeName = docType.documentCode.toLowerCase();
        const parser = documentParsers[typeName];

        if (!parser) {
            throw new Error(`[OCR] No parser found for document type: ${typeName}`);
        }

        // 2. Extract Text
        let extractedText = "";
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            if (["paar", "form_m", "sgd", "export_assessment"].includes(typeName)) {
                const fileBuffer = readFileSync(filePath);
                const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
                const formData = new FormData();
                formData.append('file', fileBlob, filePath);

                const response = await fetch(`${process.env.AI_SERVICE_BASE_URL}/file_upload?doc_type=${typeName}`, {
                    method: 'POST',
                    body: formData
                });
                const body = await response.json();
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
            throw new Error(`[OCR] Unsupported file extension ${ext}.`);
        }

        console.log(`[OCR] Extracted ${extractedText.length} characters of text for type ${typeName}.`);

        // 3. Parse with specific parser
        const parsedData = parser(extractedText);

        // 4. Validate Dependency
        let matchedKey: string | null = null;
        let existingSummaryRecord: any = null;

        if (typeName !== 'pfi') {
            if (['iins', 'export_pfi', 'fi', 'bl'].includes(typeName)) {
                // Depend on PFI
                const pfiToMatch = parsedData?.pfiNumber || parsedData?.blReference || parsedData?.naicomId || parsedData?.FI_invoiceNumber || parsedData?.pfiReference;
                // Because different parsers might return it differently, but looking at old code, they used `parsedData.pfiNumber`. Let's stick to `parsedData.pfiNumber` except if `fi` is different. Wait, old code said `const pfi = parsedData?.pfiNumber;` for all of them!
                const pfi = parsedData?.pfiNumber;

                if (!pfi) {
                    throw new Error("Document unmatched. The uploaded document does not contain a recognizable PFI number.");
                }

                const existingSummary = await db.select().from(summary).where(
                    and(eq(summary.workspaceId, workspaceId), eq(summary.pfiNumber, pfi))
                );

                if (existingSummary.length === 0) {
                    throw new Error("Document unmatched. Please upload the PFI document first and ensure it matches.");
                }

                matchedKey = pfi;
                existingSummaryRecord = existingSummary[0];
            } else if (['paar', 'eins', 'form_m', 'sgd', 'export_assessment'].includes(typeName)) {
                // Depend on Export PFI or PAAR
                let condition;
                let refValue;

                if (typeName === 'sgd' || typeName === 'export_assessment') {
                    refValue = parsedData?.ref_paarNumber;
                    if (!refValue) throw new Error("Document unmatched. Missing PAAR number in SGD document.");
                    condition = eq(summary.paarNumber, refValue);
                } else {
                    refValue = parsedData?.refElevCode;
                    if (!refValue) throw new Error("Document unmatched. Missing ELEV8 Code in document.");
                    condition = eq(summary.exportEleV8Code, refValue);
                }

                const existingSummary = await db.select().from(summary).where(
                    and(eq(summary.workspaceId, workspaceId), condition)
                );

                if (existingSummary.length === 0) {
                    throw new Error("Document unmatched. Please follow the correct upload sequence and ensure the required parent document has already been uploaded.");
                }

                matchedKey = refValue;
                existingSummaryRecord = existingSummary[0];
            }
        } else {
            // PFI itself
            matchedKey = parsedData?.pfiNumber;
        }

        return { typeName, extractedText, parsedData, matchedKey, existingSummaryRecord };
    }

    static async saveAndMerge(uploadId: number, workspaceId: number, typeName: string, extractedText: string, parsedData: any, matchedKey: string | null, existingSummary: any) {
        // Save extracted fields to document_fields
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

        // Match and Merge into Summary
        if (typeName === 'pfi') {
            const pfi = parsedData.pfiNumber;
            if (pfi) {
                let updateData: any = { updatedAt: new Date() };
                updateData.pfiDate = parsedData?.pfiDate;
                updateData.pfiFOB = parseToDecimal(parsedData?.pfiFOB);
                updateData.pfiFreight = parseToDecimal(parsedData?.pfiFreight);
                updateData.pfiTotal = parseToDecimal(parsedData?.pfiTotal);

                const pfiSummary = await db.select().from(summary).where(
                    and(eq(summary.workspaceId, workspaceId), eq(summary.pfiNumber, pfi))
                );

                if (pfiSummary.length > 0) {
                    await db.update(summary).set(updateData).where(eq(summary.id, pfiSummary[0]?.id));
                    await Promise.all(parsedData?.products?.map(async (p: any) => {
                        const existingProduct = await db.select().from(ProductLists).where(
                            and(eq(ProductLists.productPfiId, pfi), eq(ProductLists.productCode, p.productCode))
                        );

                        if (existingProduct.length > 0) {
                            await db.update(ProductLists).set({
                                productName: p.productName,
                                pfi_qty: parseToDecimal(p.qty),
                                pfi_netPrice: parseToDecimal(p.netPrice),
                            }).where(eq(ProductLists.id, existingProduct[0]?.id));
                        } else {
                            await db.insert(ProductLists).values({
                                productPfiId: pfi,
                                productCode: p.productCode,
                                productName: p.productName,
                                pfi_qty: parseToDecimal(p.qty),
                                pfi_netPrice: parseToDecimal(p.netPrice),
                            });
                        }
                    }));
                } else {
                    await db.transaction(async (tx) => {
                        const [newSummary] = await tx.insert(summary).values({
                            workspaceId,
                            pfiNumber: pfi,
                            ...updateData
                        }).returning({ pficode: summary.pfiNumber });

                        await Promise.all(parsedData?.products?.map(async (p: any) => {
                            const existingProduct = await tx.select().from(ProductLists).where(
                                and(eq(ProductLists.productPfiId, newSummary?.pficode!), eq(ProductLists.productCode, p.productCode))
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
                        }));
                    });
                }
            }
        } else if (typeName === 'fi') {
            const pfi = parsedData.pfiNumber;
            if (pfi && existingSummary) {
                let updateData: any = { updatedAt: new Date() };
                updateData.fiInvoiceNumber = parsedData?.FI_invoiceNumber;
                updateData.fiInvoiceDate = parsedData?.FI_invoiceDate;
                updateData.fiDuePaymentDate = parsedData?.FI_duePaymentDate;
                updateData.fiFob = parseToDecimal(parsedData?.FI_invoiceLineItemTotal);
                updateData.fiFreight = parseToDecimal(parsedData?.FI_freight);
                updateData.fiTotal = parseToDecimal(parsedData?.FI_invoiceTotal);
                updateData.fiNetWeight = parseToDecimal(parsedData?.FI_netWeight);
                updateData.fiGrossWeight = parseToDecimal(parsedData?.FI_grossWeight);

                await db.update(summary).set(updateData).where(eq(summary.id, existingSummary.id));
                await Promise.all(parsedData?.FI_products?.map(async (p: any) => {
                    await db.update(ProductLists).set({
                        fi_qty: parseToDecimal(p?.qty),
                        fi_netPrice: parseToDecimal(p?.netPrice),
                    }).where(and(eq(ProductLists.productPfiId, pfi), eq(ProductLists.productCode, p?.productCode!)));
                }));
            }
        } else if (['iins', 'bl', 'export_pfi'].includes(typeName)) {
            if (existingSummary) {
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
                await db.update(summary).set(updateData).where(eq(summary.id, existingSummary.id));
            }
        } else if (['form_m', 'paar', 'eins', 'sgd', 'export_assessment'].includes(typeName)) {
            if (existingSummary) {
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
                            and(eq(paarProducts.paarNumberRef, parsedData?.paarNumber), eq(paarProducts.productName, item?.DESCRIPTIONOFGOODS))
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
                    }));
                } else if (typeName === 'export_assessment' || typeName === 'sgd') {
                    updateData.AssessmentNumber = parsedData?.Assessment_No;
                    updateData.AssessmentDate = parsedData?.Assessment_Date_Of_Issue;
                    updateData.dutyAmount = parseToDecimal(parsedData?.Duty_Amount);
                }
                await db.update(summary).set(updateData).where(eq(summary.id, existingSummary.id));
            }
        }
    }
}
