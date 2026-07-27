import { Request, Response } from "express";
import { WorkspaceService } from "../services/workspace/workspace.service";

export class WorkspaceController {
    static async getDashboard(req: Request, res: Response) {
        try {
            const { year } = req.query;
            const metrics = await WorkspaceService.getDashboardMetrics(year ? parseInt(year as string) : undefined);
            res.status(200).json({ success: true, data: metrics });
        } catch (error) {
            console.error("Error in getDashboard", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    static async getWorkspaces(req: Request, res: Response) {
        try {
            const workspaces = await WorkspaceService.getAllWorkspaces();
            res.status(200).json({ success: true, data: workspaces });
        } catch (error) {
            console.error("Error in getWorkspaces", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    static async createWorkspace(req: Request, res: Response) {
        try {
            const { year, month } = req.body;
            if (!year || !month) return res.status(400).json({ success: false, message: "Year and month required" });
            const workspace = await WorkspaceService.createWorkspace(parseInt(year as string), month);
            res.status(201).json({ success: true, data: workspace });
        } catch (error) {
            console.error("Error in createWorkspace", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    static async getWorkspace(req: Request, res: Response) {
        try {
            const { year, month } = req.query;
            let workspace;

            if (year && month) {
                workspace = await WorkspaceService.getWorkspaceByYearMonth(parseInt(year as string), month as string);
            } else if (req.params.id) {
                workspace = await WorkspaceService.getWorkspaceById(parseInt(req.params.id));
            } else {
                return res.status(400).json({ success: false, message: "Missing id or year/month" });
            }

            if (!workspace) {
                return res.status(404).json({ success: false, message: "Workspace not found" });
            }

            res.status(200).json({ success: true, data: workspace });
        } catch (error) {
            console.error("Error in getWorkspace", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}
