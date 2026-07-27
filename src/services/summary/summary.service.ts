import { db } from "../../config/database";
import { summary } from "../../database/schema/summary/summary.schema";
import { eq } from "drizzle-orm";

export class SummaryService {
    static async getWorkspaceSummary(workspaceId: number) {
        // Fetch all summary records for the workspace
        const workspaceSummaries = await db.select().from(summary).where(eq(summary.workspaceId, workspaceId));
        
        if (workspaceSummaries.length === 0) return [];

        // Map them to the frontend's expected format
        const formattedSummary = workspaceSummaries.map(row => {
            const { id, workspaceId, orderPfiNumber, createdAt, updatedAt, ...rest } = row;
            
            // Reconstruct row with `pfiNumber` instead of `orderPfiNumber`
            // Ensure any null values are passed as null so the frontend can handle the `-` fallback
            return {
                id,
                pfiNumber: orderPfiNumber,
                ...rest
            };
        });

        return formattedSummary;
    }
}
