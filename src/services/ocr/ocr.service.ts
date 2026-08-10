import { db } from "../../config/database";
import { documentUploads } from "../../database/schema/documentUpload/document_upload.schema";
import { documentFields } from "../../database/schema/documentField/document_field.schema";
import { summary } from "../../database/schema/summary/summary.schema";
import { documentTypes } from "../../database/schema/documentType/document_type.schema";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import { PDFParse } from 'pdf-parse';
import { documentParsers } from "./parsers";
import convertPdfToImg from "../pdf_to_img";

export class OcrService {
    static async processDocument(uploadId: number, workspaceId: number, documentTypeId: number, filePath: string) {
        try {
            console.log(`[OCR] Starting processing for Upload ${uploadId} - File: ${filePath}`);

            // 1. Fetch document type name
            const [docType] = await db.select().from(documentTypes).where(eq(documentTypes.id, documentTypeId));
            if (!docType) throw new Error("Invalid document type");

            const typeName = docType.name.toLowerCase();
            const parser = documentParsers[typeName];

            if (!parser) {
                console.warn(`[OCR] No parser found for document type: ${typeName}`);
                await db.update(documentUploads).set({ status: 'failed' }).where(eq(documentUploads.id, uploadId));
                return;
            }
            console.log(typeName, "👍👍👍")
            // 2. Extract Text
            let extractedText = "";
            const ext = path.extname(filePath).toLowerCase();
            if (ext === '.pdf') {

                console.log(typeName, "✨✨")

                const dataBuffer = fs.readFileSync(filePath);

                if (typeName === "bl" || typeName == "form_m") {

                    await convertPdfToImg(filePath)

                    // const data = await pdfParser.getText();
                    // extractedText = data.text;

                } else {

                    const pdfParser = new PDFParse({ data: dataBuffer });
                    const data = await pdfParser.getText();
                    extractedText = data.text;

                }
            } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
                const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
                extractedText = text;

                console.log(extractedText, "❌❌❌❌❌❌ IMG Tensseract")
            } else {
                console.warn(`[OCR] Unsupported file extension ${ext}.`);
            }

            console.log(`[OCR] Extracted ${extractedText.length} characters of text for type ${typeName}.`);

            // 3. Parse with specific parser
            const parsedData = parser(extractedText);

            // console.log(parsedData, "👍👍👍 🏢🏢☠️☠️")

            // 4. Save extracted fields to document_fields
            const fieldsToInsert = Object.entries(parsedData)
                .filter(([_, value]) => value !== null && value !== undefined)
                .map(([fieldName, fieldValue]) => ({
                    documentId: uploadId,
                    fieldName,
                    fieldValue: String(fieldValue),
                }));

            if (fieldsToInsert.length > 0) {
                await db.insert(documentFields).values(fieldsToInsert);
            }

            // 5. Match and Merge into Summary
            let matchedKey: string | null = null;
            let finalStatus = 'parsed';

            if (typeName === 'order') {
                const pfi = parsedData.pfiNumber;
                if (pfi) {
                    matchedKey = pfi;
                    const existingSummary = await db.select().from(summary).where(
                        and(eq(summary.workspaceId, workspaceId), eq(summary.orderPfiNumber, pfi))
                    );

                    const updateData = {
                        invoiceDate: parsedData.invoiceDate,
                        productName: parsedData.productName,
                        qty: parsedData.qty,
                        netPrice: parsedData.netPrice,
                        updatedAt: new Date(),
                    };

                    if (existingSummary.length > 0) {
                        await db.update(summary).set(updateData).where(eq(summary?.id, existingSummary[0]?.id));
                    } else {
                        await db.insert(summary).values({
                            workspaceId,
                            orderPfiNumber: pfi,
                            ...updateData,
                        });
                    }
                    finalStatus = 'merged';

                    // We could trigger a re-evaluation of unmatched documents here if needed.
                } else {
                    finalStatus = 'unmatched';
                }
            } else if (['insurance', 'bl', 'export_pfi'].includes(typeName)) {
                const pfi = parsedData?.pfiNumber;
                // console.log(pfi, "✨✨✨✨✨👤👤")
                if (pfi) {
                    const existingSummary = await db.select().from(summary).where(
                        and(eq(summary.workspaceId, workspaceId), eq(summary.orderPfiNumber, pfi))
                    );

                    if (existingSummary.length > 0) {
                        matchedKey = pfi;
                        finalStatus = 'merged';

                        let updateData: any = { updatedAt: new Date() };
                        if (typeName === 'insurance') {
                            updateData.insuranceNaicomId = parsedData.naicomId;
                            updateData.insuranceDateOfIssue = parsedData.dateOfIssue;
                            updateData.insurancePremiumAmount = parsedData.premium;
                        } else if (typeName === 'bl') {
                            updateData.blReference = parsedData.blReference;
                        } else if (typeName === 'export_pfi') {
                            updateData.exportPfiNumber = parsedData.exportPfiNumber;
                        }

                        await db.update(summary).set(updateData).where(eq(summary?.id, Number(existingSummary[0]?.id)));
                    } else {
                        finalStatus = 'unmatched';
                    }
                } else {
                    finalStatus = 'unmatched';
                }
            } else if (['form_m', 'paar', 'export_assessment'].includes(typeName)) {
                const exportPfi = parsedData.exportPfiNumber;
                if (exportPfi) {
                    const existingSummary = await db.select().from(summary).where(
                        and(eq(summary.workspaceId, workspaceId), eq(summary.exportPfiNumber, exportPfi))
                    );

                    if (existingSummary.length > 0) {
                        matchedKey = exportPfi;
                        finalStatus = 'merged';

                        let updateData: any = { updatedAt: new Date() };
                        if (typeName === 'form_m') {
                            updateData.baNumber = parsedData.baNumber;
                            updateData.formNumber = parsedData.formNumber;
                        } else if (typeName === 'paar') {
                            updateData.paarNumber = parsedData.paarNumber;
                        } else if (typeName === 'export_assessment') {
                            updateData.exportAssessmentAmount = parsedData.exportAssessmentAmount;
                            updateData.exportAssessmentCno = parsedData.exportAssessmentCno;
                        }

                        await db.update(summary).set(updateData).where(eq(summary.id, existingSummary[0].id));
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
