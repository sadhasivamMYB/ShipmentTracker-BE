import { eq } from "drizzle-orm";
import { db } from "../../config/database";
import { documentTypes, fieldDefinitions } from "../schema";


export async function seedFieldDefinitions() {

    const docs = await db.select().from(documentTypes);

    const order = docs.find(d => d.code === "ORDER");
    const insurance = docs.find(d => d.code === "INSURANCE");
    const bl = docs.find(d => d.code === "BL");
    const formM = docs.find(d => d.code === "FORM_M");

    if (!order || !insurance || !bl || !formM) {
        throw new Error("Document types not found.");
    }

    await db.insert(fieldDefinitions).values([

        // ORDER
        {
            documentTypeId: order.id,
            sourceField: "PFI Number",
            fieldKey: "pfi",
            summaryColumn: "pfi",
            dataType: "string",
            displayOrder: 1,
            isRequired: true,
        },
        {
            documentTypeId: order.id,
            sourceField: "PFI Invoice",
            fieldKey: "invoice",
            summaryColumn: "invoice",
            dataType: "string",
            displayOrder: 2,
        },
        {
            documentTypeId: order.id,
            sourceField: "SKU Name",
            fieldKey: "sku",
            summaryColumn: "sku",
            dataType: "string",
            displayOrder: 3,
        },
        {
            documentTypeId: order.id,
            sourceField: "Qty",
            fieldKey: "qty",
            summaryColumn: "qty",
            dataType: "number",
            displayOrder: 4,
        },

        // INSURANCE

        {
            documentTypeId: insurance.id,
            sourceField: "Insurance Number",
            fieldKey: "insuranceNumber",
            summaryColumn: "insurance_number",
            dataType: "string",
            displayOrder: 1,
        },
        {
            documentTypeId: insurance.id,
            sourceField: "Insurance Date",
            fieldKey: "insuranceDate",
            summaryColumn: "insurance_date",
            dataType: "date",
            displayOrder: 2,
        },
        {
            documentTypeId: insurance.id,
            sourceField: "Premium Amount",
            fieldKey: "premiumAmount",
            summaryColumn: "premium_amount",
            dataType: "number",
            displayOrder: 3,
        },

        // BL

        {
            documentTypeId: bl.id,
            sourceField: "BL Number",
            fieldKey: "blNumber",
            summaryColumn: "bl_number",
            dataType: "string",
            displayOrder: 1,
        },
        {
            documentTypeId: bl.id,
            sourceField: "Vessel",
            fieldKey: "vessel",
            summaryColumn: "vessel",
            dataType: "string",
            displayOrder: 2,
        },

        // FORM M

        {
            documentTypeId: formM.id,
            sourceField: "Form M Number",
            fieldKey: "formMNumber",
            summaryColumn: "form_m_number",
            dataType: "string",
            displayOrder: 1,
        },
        {
            documentTypeId: formM.id,
            sourceField: "Applicant",
            fieldKey: "applicant",
            summaryColumn: "applicant",
            dataType: "string",
            displayOrder: 2,
        },

    ]).onConflictDoNothing();
}