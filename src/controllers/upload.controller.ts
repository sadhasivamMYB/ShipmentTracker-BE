import { Request, Response } from "express";
import { UploadService } from "../services/upload/upload.service";

export class UploadController {
    static async uploadDocument(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }

            const { workspaceId, documentTypeCode } = req.body;
            if (!workspaceId || !documentTypeCode) {
                return res.status(400).json({ success: false, message: "workspaceId and documentTypeCode are required" });
            }

            // Assuming user is authenticated and attached to req.user (handled by auth middleware)
            const userId = (req as any).user?.id;

            const uploadRecord = await UploadService.handleUpload(
                parseInt(workspaceId),
                documentTypeCode,
                userId,
                file
            );

            res.status(200).json({ success: true, data: uploadRecord });
        } catch (error: any) {
            console.error("Error in uploadDocument:", error);
            
            // Delete the file if validation or processing fails
            if (req.file && req.file.path) {
                try {
                    const fs = require('fs');
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }
                } catch (cleanupError) {
                    console.error("Failed to delete temp file:", cleanupError);
                }
            }

            // Return 400 for validation errors, 500 otherwise
            const statusCode = error.message && error.message.includes("Document unmatched") ? 400 : 500;
            res.status(statusCode).json({ 
                success: false, 
                message: error.message || String(error) || "Internal server error during upload",
                stack: error.stack
            });
        }
    }
}
