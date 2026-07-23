import { db } from "../../config/database";
import { documentTypes } from "../schema";


export async function seedDocumentTypes() {
    return await db
        .insert(documentTypes)
        .values([
            {
                code: "ORDER",
                name: "Order",
                displayOrder: 1,
                isRequired: true,
            },
            {
                code: "INSURANCE",
                name: "Insurance",
                displayOrder: 2,
            },
            {
                code: "BL",
                name: "Bill of Lading",
                displayOrder: 3,
            },
            {
                code: "FORM_M",
                name: "Form M",
                displayOrder: 4,
            },
        ])
        .onConflictDoNothing();
}