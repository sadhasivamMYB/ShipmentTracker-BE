import { WorkspaceService } from "../services/workspace.service"


export class WorkspacesContorller {

    static async createWorkspace(req: any, res: any) {

        const { year, month } = req.body

        try {

            const result = await WorkspaceService.createWorkspace({ year, month })
            return res.json({ success: true, message: "Workspace created successfully", data: result })
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message })
        }


    }


    static async updateWorkspace() {

    }

    static async deleteWorkspace() {

    }

    static async getWorkspaces(req: any, res: any) {

        try {
            const result = await WorkspaceService.getWorkspaces()
            return res.json({ success: true, message: "Workspace fetched successfully", data: result ?? [] })
        } catch (err: any) {
            return res.status(500).json({ success: false, message: err.message })
        }

    }
}