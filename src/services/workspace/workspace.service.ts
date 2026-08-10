import { db } from "../../config/database";
import { workspaces } from "../../database/schema/workspace/workspace.schema";
import { documentUploads } from "../../database/schema/documentUpload/document_upload.schema";
import { eq, desc, and } from "drizzle-orm";

export class WorkspaceService {
    static async getAllWorkspaces() {
        return await db.select().from(workspaces).orderBy(desc(workspaces.year), desc(workspaces.month));
    }

    static async getWorkspaceById(id: number) {
        const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
        if (!result[0]) return null;

        const uploads = await db.select().from(documentUploads)
            .where(eq(documentUploads.workspaceId, result[0].id));

        return { ...result[0], documentUploads: uploads };
    }

    static async getWorkspaceByYearMonth(year: number, month: string) {
        const result = await db.select().from(workspaces)
            .where(and(eq(workspaces.year, year), eq(workspaces.month, month)))
            .limit(1);
            
        if (!result[0]) return null;

        const uploads = await db.select().from(documentUploads)
            .where(eq(documentUploads.workspaceId, result[0].id));

        return { ...result[0], documentUploads: uploads };
    }

    static async createWorkspace(year: number, month: string) {
        const [newWs] = await db.insert(workspaces).values({
            year,
            month,
            status: 'Pending'
        }).returning();
        return newWs;
    }

    static async getDashboardMetrics(year?: number) {
        const allWorkspaces = await db.select().from(workspaces);
        const allUploads = await db.select().from(documentUploads);
        
        const totalWorkspaces = allWorkspaces.length;
        const completedMonths = allWorkspaces.filter(ws => ws.status === 'Completed').length;
        const pendingWorkspaces = allWorkspaces.filter(ws => ws.status !== 'Completed').slice(0, 5);
        
        const totalUploads = allUploads.length;
        const pendingOcr = allUploads.filter(up => up.status === 'Processing').length;
        
        return {
            totalWorkspaces,
            completedMonths,
            pendingOcr,
            totalUploads,
            pendingWorkspaces,
            recentUploads: allUploads.slice(0, 5) // Simplified for mock
        };
    }
}
