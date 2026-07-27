import "dotenv/config";
import { db } from "../../config/database";
import { users } from "../schema/users/users.schema";
import { workspaces } from "../schema/workspace/workspace.schema";
import { documentTypes } from "../schema/documentType/document_type.schema";
import { fieldDefinitions } from "../schema/fieldDefinition/field_definition.schema";
import { documentUploads } from "../schema/documentUpload/document_upload.schema";
import { registrations } from "../schema/registration/registration.schema";
import { registrationFields } from "../schema/registrationField/registration_field.schema";
import bcrypt from "bcrypt";

async function seed() {
    console.log("Seeding database...");

    try {
        // Clean up existing data (Reverse order of dependencies)
        await db.delete(registrationFields);
        await db.delete(registrations);
        await db.delete(documentUploads);
        await db.delete(fieldDefinitions);
        await db.delete(documentTypes);
        await db.delete(workspaces);
        await db.delete(users);

        console.log("Cleared existing data.");

        // 1. Users
        const passwordHash = await bcrypt.hash("password123", 10);
        const [admin] = await db.insert(users).values({
            fullName: "Admin User",
            email: "admin@company.com",
            password: passwordHash,
            role: "admin"
        }).returning();

        const [regularUser] = await db.insert(users).values({
            fullName: "Regular User",
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
            { name: "Order", description: "Purchase Order" },
            { name: "Insurance", description: "Insurance Certificate" },
            { name: "Bill of Lading", description: "Ocean Bill of Lading" }
        ];

        const insertedDocTypes = await db.insert(documentTypes).values(docTypes).returning();

        const orderDoc = insertedDocTypes.find(d => d.name === "Order")!;
        const insuranceDoc = insertedDocTypes.find(d => d.name === "Insurance")!;
        const blDoc = insertedDocTypes.find(d => d.name === "Bill of Lading")!;

        // 4. Field Definitions
        const fields = [
            // Order Fields
            { documentTypeId: orderDoc.id, fieldName: "pfiInvoice", fieldType: "string" },
            { documentTypeId: orderDoc.id, fieldName: "skuName", fieldType: "string" },
            { documentTypeId: orderDoc.id, fieldName: "quantity", fieldType: "number" },
            // Insurance Fields
            { documentTypeId: insuranceDoc.id, fieldName: "insuranceDate", fieldType: "string" },
            { documentTypeId: insuranceDoc.id, fieldName: "naicomId", fieldType: "string" },
            { documentTypeId: insuranceDoc.id, fieldName: "premiumAmount", fieldType: "number" },
            // BL Fields
            { documentTypeId: blDoc.id, fieldName: "blNumber", fieldType: "string" },
            { documentTypeId: blDoc.id, fieldName: "sealNumber", fieldType: "string" },
            { documentTypeId: blDoc.id, fieldName: "containerSize", fieldType: "string" },
        ];

        const insertedFields = await db.insert(fieldDefinitions).values(fields).returning();

        // 5. Registrations
        const pfis = ["PFI-1001", "PFI-1002", "PFI-1003"];
        const insertedRegs = await db.insert(registrations).values(
            pfis.map(pfi => ({ workspaceId: workspace.id, pfiNumber: pfi }))
        ).returning();

        // 6. Document Uploads (Simulate completed OCR)
        const [orderUpload] = await db.insert(documentUploads).values({
            workspaceId: workspace.id,
            documentTypeId: orderDoc.id,
            fileName: "Order_Jan2024.pdf",
            filePath: "uploads/Order_Jan2024.pdf",
            uploadedBy: admin.id,
            status: "Completed"
        }).returning();

        const [insuranceUpload] = await db.insert(documentUploads).values({
            workspaceId: workspace.id,
            documentTypeId: insuranceDoc.id,
            fileName: "Insurance_Jan2024.pdf",
            filePath: "uploads/Insurance_Jan2024.pdf",
            uploadedBy: admin.id,
            status: "Completed"
        }).returning();

        // 7. Registration Fields (Extracted Values)
        const mockExtractedFields = [];

        // For PFI-1001
        mockExtractedFields.push(
            { registrationId: insertedRegs[0].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'pfiInvoice')!.id, documentUploadId: orderUpload.id, extractedValue: "INV-1001" },
            { registrationId: insertedRegs[0].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'skuName')!.id, documentUploadId: orderUpload.id, extractedValue: "Widget A" },
            { registrationId: insertedRegs[0].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'quantity')!.id, documentUploadId: orderUpload.id, extractedValue: "500" },
            { registrationId: insertedRegs[0].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'insuranceDate')!.id, documentUploadId: insuranceUpload.id, extractedValue: "2024-01-05" },
            { registrationId: insertedRegs[0].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'premiumAmount')!.id, documentUploadId: insuranceUpload.id, extractedValue: "250.00" }
        );

        // For PFI-1002
        mockExtractedFields.push(
            { registrationId: insertedRegs[1].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'pfiInvoice')!.id, documentUploadId: orderUpload.id, extractedValue: "INV-1002" },
            { registrationId: insertedRegs[1].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'skuName')!.id, documentUploadId: orderUpload.id, extractedValue: "Widget B" },
            { registrationId: insertedRegs[1].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'quantity')!.id, documentUploadId: orderUpload.id, extractedValue: "1200" },
            { registrationId: insertedRegs[1].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'insuranceDate')!.id, documentUploadId: insuranceUpload.id, extractedValue: "2024-01-08" },
            { registrationId: insertedRegs[1].id, fieldDefinitionId: insertedFields.find(f => f.fieldName === 'premiumAmount')!.id, documentUploadId: insuranceUpload.id, extractedValue: "540.00" }
        );

        await db.insert(registrationFields).values(mockExtractedFields);

        console.log("Seeding complete! ✨");
        console.log("Use admin@example.com / password123 to login.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
