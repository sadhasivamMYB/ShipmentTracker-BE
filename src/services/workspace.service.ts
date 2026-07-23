import { db } from "../config/database";
import { workspaces } from "../database/schema";


export class WorkspaceService {

    static async createWorkspace(data: any) {

        const [result] = await db.insert(workspaces)
            .values({
                ...data,
            })
            .returning();

        return result;

    }


    static async updateWorkspace() {

    }

    static async deleteWorkspace() {

    }

    static async getWorkspace() {

    }

    static async getWorkspaces() {


        const result = await db.query.workspaces.findMany();

        if (result.length > 0) {
            return result;
        }
        
        return null;
    }
}