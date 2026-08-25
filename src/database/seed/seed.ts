import "dotenv/config";
import { db } from "../../config/database";
import { users } from "../schema/users/users.schema";
import { workspaces } from "../schema/workspace/workspace.schema";
import { documentTypes } from "../schema/documentType/document_type.schema";
import { documentUploads } from "../schema/documentUpload/document_upload.schema";

import bcrypt from "bcrypt";
import { promise } from "zod";

async function seed() {
    console.log("Seeding database...");

    try {
        // Clean up existing data (Reverse order of dependencies)
        await db.delete(documentUploads);
        await db.delete(documentTypes);
        await db.delete(workspaces);
        await db.delete(users);

        console.log("Cleared existing data.");

        // 1. Users
        const passwordHash = await bcrypt.hash("password123", 10);
        const [admin] = await db.insert(users).values({
            fullName: "Kiran",
            email: "admin@company.com",
            password: passwordHash,
            role: "admin"
        }).returning();

        const [regularUser] = await db.insert(users).values({
            fullName: "Tharun",
            email: "user@company.com",
            password: passwordHash,
            role: "user"
        }).returning();

        // 2. Workspace
        const [workspace] = await db.insert(workspaces).values({
            year: 2024,
            month: "January",
            status: "In Progress"
        }).returning();

        // 3. Document Types
        const docTypes = [
            { name: "PFI", code: "PFI", description: "PFI" },
            { name: "Insurance", code: "ins", description: "Insurance Certificate" },
            { name: "Export Insurance", code: "eins", description: "Export Insurance Certificate" },
            { name: "export pfi", code: "export_pfi", description: "export PFI" },
            { name: "SGD", code: "sgd", description: "SG D" },
            { name: "Form M", code: "form_m", description: "Form M" },
            { name: "PAAR", code: "PAAR", description: "PAAR Document" },
            { name: "Final Invoice", code: "FI", description: "Final Invoice Document" },

        ];

        await Promise.all(docTypes.map(async (docType) => {
            await db.insert(documentTypes).values({
                name: docType.name,
                documentCode: docType.code,
                status: "active",
                description: docType.description,

            });
        }));

        console.log("Seeding complete! ✨");
        console.log("Use admin@example.com / password123 to login.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
