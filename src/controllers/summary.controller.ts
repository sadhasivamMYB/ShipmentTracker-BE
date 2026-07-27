import { Request, Response } from "express";
import { SummaryService } from "../services/summary/summary.service";
import { ExcelService } from "../services/excel/excel.service";

export class SummaryController {
    static async getSummary(req: Request, res: Response) {
        try {
            const { workspaceId } = req.query;
            if (!workspaceId) {
                return res.status(400).json({ success: false, message: "workspaceId is required" });
            }

            const summary = await SummaryService.getWorkspaceSummary(parseInt(workspaceId as string));
            res.status(200).json({ success: true, data: summary });
        } catch (error) {
            console.error("Error in getSummary:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    static async exportSummaryExcel(req: Request, res: Response) {
        try {
            const { workspaceId } = req.query;
            if (!workspaceId) {
                return res.status(400).json({ success: false, message: "workspaceId is required" });
            }

            const summary = await SummaryService.getWorkspaceSummary(parseInt(workspaceId as string));
            const buffer = await ExcelService.generateExcelBuffer(summary);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="Summary_${workspaceId}.xlsx"`);
            res.send(buffer);
        } catch (error) {
            console.error("Error in exportSummaryExcel:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}
