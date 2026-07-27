import { Request, Response } from "express";
import { UploadService } from "../services/upload/upload.service";

export class UploadController {
    static async uploadDocument(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }

            const { workspaceId, documentTypeId } = req.body;
            if (!workspaceId || !documentTypeId) {
                return res.status(400).json({ success: false, message: "workspaceId and documentTypeId are required" });
            }

            // Assuming user is authenticated and attached to req.user (handled by auth middleware)
            const userId = (req as any).user?.id;

            const uploadRecord = await UploadService.handleUpload(
                parseInt(workspaceId),
                parseInt(documentTypeId),
                userId,
                file
            );

            res.status(200).json({ success: true, data: uploadRecord });
        } catch (error) {
            console.error("Error in uploadDocument:", error);
            res.status(500).json({ success: false, message: "Internal server error during upload" });
        }
    }
}
