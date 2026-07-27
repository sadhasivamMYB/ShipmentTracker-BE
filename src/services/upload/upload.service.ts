import { db } from "../../config/database";
import { documentUploads } from "../../database/schema/documentUpload/document_upload.schema";
import { documentFields } from "../../database/schema/documentField/document_field.schema";
import { eq } from "drizzle-orm";
import { OcrService } from "../ocr/ocr.service";

export class UploadService {
    static async handleUpload(
        workspaceId: number,
        documentTypeId: number,
        userId: number,
        file: Express.Multer.File
    ) {
        // Document Replacement Rule:
        // Remove previously extracted fields related to old uploads for this exact doc type in this workspace
        const previousUploads = await db.select().from(documentUploads).where(
            eq(documentUploads.workspaceId, workspaceId)
        );
        const prevDocUpload = previousUploads.find(u => u.documentTypeId === documentTypeId);

        if (prevDocUpload) {
            // Delete old document fields
            await db.delete(documentFields).where(eq(documentFields.documentId, prevDocUpload.id));

            // Delete old document upload record
            await db.delete(documentUploads).where(eq(documentUploads.id, prevDocUpload.id));
        }

        // Insert new document upload
        const [newUpload] = await db.insert(documentUploads).values({
            workspaceId,
            documentTypeId,
            fileName: file.originalname,
            filePath: file.path,
            uploadedBy: userId,
            status: 'processing'
        }).returning();

        // Trigger OCR (Async or await depending on needs)
        await OcrService.processDocument(newUpload?.id, workspaceId, documentTypeId, file.path);

        return newUpload;
    }
}
