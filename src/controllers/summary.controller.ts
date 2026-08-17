import { Request, Response } from "express";
import { SummaryService } from "../services/summary/summary.service";
import { ExcelService } from "../services/excel/excel.service";
import { UpdateSummarySchema } from "../utils/validators";
import { z } from "zod";

export class SummaryController {
    static async getSummary(req: Request, res: Response) {
        try {
            const { workspaceId, search } = req.query;
            // if (!workspaceId) {
            //     return res.status(400).json({ success: false, message: "workspaceId is required" });
            // }

            const summary = await SummaryService.getWorkspaceSummary(parseInt(workspaceId as string), search as string);
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

            const summary = await SummaryService.exportToExcel(parseInt(workspaceId as string));
            const buffer = await ExcelService.generateExcelBuffer(summary!);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="Summary_${workspaceId}.xlsx"`);
            res.send(buffer);
        } catch (error) {
            console.error("Error in exportSummaryExcel:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    static async getSelectedRowData(req: Request, res: Response) {
        try {
            const { pfi } = req.params;
            if (!pfi) {
                return res.status(400).json({ success: false, message: "pfi are required" });
            }

            const rowData = await SummaryService.getSelectedRowData(pfi as string);
            res.status(200).json({ success: true, data: rowData });
        } catch (error) {
            console.error("Error in getSelectedRowData:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    static async updateRow(req: Request, res: Response) {
        try {
            const pfi = req.params?.pfi as string;
            if (!pfi) {
                return res.status(400).json({ success: false, message: "pfi is required" });
            }

            // Validate req.body using Zod
            const validatedData = UpdateSummarySchema.parse(req.body);

            // Strip out any undefined keys so Drizzle doesn't try to insert them
            const dataToUpdate = Object.fromEntries(
                Object.entries(validatedData).filter(([_, v]) => v !== undefined)
            );

            const updatedSummary = await SummaryService.updateSummaryData(pfi, dataToUpdate);

            res.status(200).json({ success: true, data: updatedSummary });
        } catch (error) {
            console.error("Error in updateRow:", error);
            if (error instanceof z.ZodError) {
                return res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
            }
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}
