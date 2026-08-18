import path from "path";
import { db } from "../../config/database";
import { template, templateField } from "../../database/schema";
import { extractFields } from "../../utils/extractor";
import { eq } from "drizzle-orm";
import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";



export class TemplateService {

    static async templateFormKeys(id: number) {
        try {
            const templateRecords = await db.select().from(template).where(eq(template.id, id)).limit(1);
            if (!templateRecords || templateRecords.length === 0) {
                throw new Error("Template not found");
            }

            const templateFormKey = await db.select().from(templateField)
                .where(eq(templateField.template_id, id))
                .orderBy(templateField.order);

            return {
                id: templateRecords[0]?.id,
                name: templateRecords[0]?.name,
                file_name: templateRecords[0]?.file_path,
                formKeys: templateFormKey
            };
        } catch (error) {
            console.error("Error in templateFormKeys:", error);
            throw error;
        }
    }

    // File extension extract
    static getFileExtension(filePath: string) {
        return filePath.split('.').pop();
    }

    // function for rendering in the template
    static async renderDocs(templatePath: any, values: any) {
        // Read template
        const content = fs.readFileSync(templatePath, "binary");

        // Load zip
        const zip = new PizZip(content);

        // Create document
        const doc = new Docxtemplater(zip, {
            delimiters: {
                start: "{{",
                end: "}}",
            },
        });

        // Replace placeholders
        doc.render(values);



        // Return generated document
        return doc.getZip().generate({
            type: "nodebuffer",
            compression: "DEFLATE",
        });


    }


    //  Get All Documents Template

    static async getAllTemplate() {
        try {
            const allTemplates = await db.select().from(template)

            return allTemplates

        } catch (error) {
            console.error("Error in createTemplate:", error);
            throw error;
        }
    }

    static async renderInTemplate(template_id: number, FormValues: Object) {

        const selectedTemplate = await db.select().from(template)
            .where(eq(template.id, template_id))
            .limit(1);

        if (!selectedTemplate) {
            throw new Error("Template not found")
        }

        const templatePath = selectedTemplate[0]?.file_path;
        const renderedDocument = await this.renderDocs(templatePath, FormValues);

        const fileName = `generated-${Date.now()}.docx`;
        const outputPath = path.join(
            "uploads",
            "generated",
            fileName
        );

        fs.writeFileSync(outputPath, renderedDocument);

        return renderedDocument;

    }

    static async uploadTemplate(file: any, templateName: string, userId: number) {
        try {
            const extension = this.getFileExtension(file.path);
            if (extension !== 'docx' && extension !== 'doc') {
                throw new Error('Invalid file type. Only DOC and DOCX files are allowed.');
            }

            const [templateInsert] = await db.insert(template).values({
                name: templateName,
                file_path: file.path,
                created_by: userId
            }).returning({
                id: template.id,
                name: template.name,
                file_path: template.file_path,
                created_at: template.created_at,
                updated_at: template.updated_at
            });

            const templateId = templateInsert?.id;
            const templateFilePath = templateInsert?.file_path;

            const formKeys = await extractFields(templateFilePath!, templateId!);

            return {
                id: templateId,
                name: templateInsert?.name,
                file_name: file.originalname,
                createdAt: templateInsert?.created_at,
                updatedAt: templateInsert?.updated_at,
                formKeys
            };
        } catch (error) {
            console.error("Error in uploadTemplate:", error);
            throw error;
        }
    }

    static async updateTemplate(id: number, templateName?: string, file?: any) {
        try {
            const existingTemplates = await db.select().from(template).where(eq(template.id, id)).limit(1);
            if (!existingTemplates || existingTemplates.length === 0) {
                throw new Error("Template not found");
            }

            const existing = existingTemplates[0];
            const updateData: any = { updated_at: new Date() };
            if (templateName) updateData.name = templateName;
            if (file) updateData.file_path = file.path;

            const [updatedTemplate] = await db.update(template).set(updateData).where(eq(template.id, id)).returning({
                id: template.id,
                name: template.name,
                file_path: template.file_path,
                created_at: template.created_at,
                updated_at: template.updated_at
            });

            let formKeys;
            if (file) {
                // Delete existing form keys
                await db.delete(templateField).where(eq(templateField.template_id, id));
                // Extract new form keys
                formKeys = await extractFields(updatedTemplate?.file_path!, id);
            } else {
                formKeys = await db.select().from(templateField).where(eq(templateField.template_id, id)).orderBy(templateField.order);
            }

            return {
                id: updatedTemplate?.id,
                name: updatedTemplate?.name,
                file_name: file ? file.originalname : path.basename(existing?.file_path!),
                createdAt: updatedTemplate?.created_at,
                updatedAt: updatedTemplate?.updated_at,
                formKeys
            };
        } catch (error) {
            console.error("Error in updateTemplate:", error);
            throw error;
        }
    }

    static async deleteTemplate(id: number) {
        const deleted = await db
            .delete(template)
            .where(eq(template.id, id))
            .returning();
        return deleted;
    }
}