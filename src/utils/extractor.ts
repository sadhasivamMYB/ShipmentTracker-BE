import mammoth from "mammoth";
import { templateField } from "../database/schema";
import { db } from "../config/database";

const regex = /\{\{(.*?)\}\}/g;


export async function extractFields(path: string, templateId: number) {
    const { value } = await mammoth.extractRawText({ path });

    const matches = [...value.matchAll(regex)];

    const fields = matches.map(match => match[1]);

    const uniqueFields = [...new Set(fields)];
    const formKeys = [];
    
    let currentOrder = 1;
    for (const field of uniqueFields) {
        const [insertedField] = await db.insert(templateField).values({
            template_id: templateId,
            field_name: field || "",
            field_label: (field || "").split("_").join(" ").toLocaleLowerCase(),
            field_type: "text",
            required: true,
            order: currentOrder++,
        }).returning({ 
            id: templateField.id,
            template_id: templateField.template_id,
            field_name: templateField.field_name,
            field_label: templateField.field_label,
            field_type: templateField.field_type,
            required: templateField.required,
            default_value: templateField.default_value,
            order: templateField.order
        });
        formKeys.push(insertedField);
    }
    return formKeys;
}