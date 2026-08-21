import { db } from "../../config/database";
import { documentUploads } from "../../database/schema/documentUpload/document_upload.schema";
import { documentFields } from "../../database/schema/documentField/document_field.schema";
import { eq } from "drizzle-orm";
import { OcrService } from "../ocr/ocr.service";
import { documentTypes } from "../../database/schema";

export class UploadService {
    static async handleUpload(
        workspaceId: number,
        documentTypeCode: string,
        userId: number,
        file: Express.Multer.File
    ) {
        const [documentTypeId] = await db.select({ id: documentTypes.id }).from(documentTypes).where(eq(documentTypes.documentCode, documentTypeCode));

        // 1. Run OCR and Validation first!
        // This will throw an error if the document is unmatched (e.g. no parent PFI/Export PFI)
        const ocrResult = await OcrService.processAndValidate(workspaceId, documentTypeId?.id!, file.path);

        // 2. If it passed validation, insert the document upload record
        const [newUpload] = await db.insert(documentUploads).values({
            workspaceId,
            documentTypeId: documentTypeId?.id!,
            fileName: file.originalname,
            filePath: file.path,
            uploadedBy: userId,
            status: 'merged' // Status is now automatically merged since validation passed
        }).returning();

        // 3. Save extracted fields and merge into summary table
        await OcrService.saveAndMerge(
            newUpload?.id!,
            workspaceId,
            ocrResult.typeName,
            ocrResult.extractedText,
            ocrResult.parsedData,
            ocrResult.matchedKey,
            ocrResult.existingSummaryRecord
        );

        return newUpload;
    }
}
