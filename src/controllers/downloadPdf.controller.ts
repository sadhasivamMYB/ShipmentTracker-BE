import { Request, Response } from "express";
import { documentUploads, documentFields, documentTypes } from "../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../config/database";
import path from "path";
import fs from "fs";

export class DownloadPdfController {
    static async downloadPdf(req: Request, res: Response) {
        try {
            const { workspaceId, documentType, referenceKey, referenceValue } = req.params;

            // Get the specific document type (ensure uppercase)
            const [docType] = await db.select().from(documentTypes).where(eq(documentTypes.documentCode, documentType?.toUpperCase()));

            if (!docType) {
                return res.status(404).json({ message: "Document type not found" });
            }

            // Get the latest document for this reference directly from documentUploads
            const docs = await db.select({
                filePath: documentUploads.filePath,
                fileName: documentUploads.fileName
            })
                .from(documentUploads)
                .where(
                    and(
                        eq(documentUploads.workspaceId, Number(workspaceId)),
                        eq(documentUploads.documentTypeId, docType.id),
                        eq(documentUploads.referenceKey, referenceKey),
                        eq(documentUploads.referenceValue, referenceValue)
                    )
                )
                .orderBy(desc(documentUploads.uploadedAt))
                .limit(1);

            const document = docs[0];

            if (!document) {
                return res.status(404).json({
                    message: "Document not found",
                });
            }

            const filePath = path.resolve(document.filePath);

            // Check if file actually exists
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    message: "PDF file not found",
                });
            }

            res.download(
                filePath,
                document.fileName || "document.pdf",
                (err) => {
                    if (err) {
                        console.error("Download error:", err);
                    }
                }
            );
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                message: "Failed to download document",
            });
        }
    }
}