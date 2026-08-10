

import type { Request, Response } from "express"
import { TemplateService } from "../services/template/template.service";


// interface Req extends Request {
//     body: {
//         documentTypeId: number;
//     };
//     user: any
// }


export class TemplateController {


    static async getAllTemplates(req: any, res: Response) {
        try {
            const templates = await TemplateService.getAllTemplate();
            res.status(200).json({ success: true, data: templates });
        } catch (error) {
            console.error("Error in getAllTemplates:", error);
            res.status(500).json({ success: false, message: "Internal server error during template retrieval" });
        }
    }

    // static async createTemplate(req: Request, res: Response) {
    //     try {
    //         const { name, fields } = req.body;
    //         if (!name || !fields) {
    //             return res.status(400).json({ success: false, message: "Name and fields are required" });
    //         }
    //         const template = await TemplateService.createTemplate(name, fields);
    //         res.status(201).json({ success: true, data: template });
    //     } catch (error) {
    //         console.error("Error in createTemplate:", error);
    //         res.status(500).json({ success: false, message: "Internal server error during template creation" });
    //     }
    // }

    // selected template
    static async selectedTemplate(req: any, res: Response) {
        try {
            const { template_id } = req.params;
            if (!template_id) {
                return res.status(400).json({ success: false, message: "template_id is required" });
            }
            const template = await TemplateService.templateFormKeys(Number(template_id));
            res.status(201).json({ success: true, data: template });

        } catch (error) {
            console.error("Error in selectedTemplate:", error);
            res.status(500).json({ success: false, message: "Internal server error during template selection" });
        }
    }

    static async renderTemplate(req: any, res: Response) {
        try {
            const { template_id } = req.params;
            const formValues = req.body;
            if (!template_id) {
                return res.status(400).json({ success: false, message: "template_id is required" });
            }
            const buffer = await TemplateService.renderInTemplate(Number(template_id), Object(formValues));

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            res.setHeader("Content-Disposition", 'attachment; filename="document.docx"');
            res.status(200).send(buffer);
        } catch (error) {
            console.error("Error in renderTemplate:", error);
            res.status(500).json({ success: false, message: "Internal server error during template rendering" });
        }
    }


    static async uploadTemplateDocument(req: any, res: Response) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }
            const { templateName } = req.body;
            if (!templateName) {
                return res.status(400).json({ success: false, message: "templateName is required" });
            }
            const template = await TemplateService.uploadTemplate(file, templateName, req.user.id);
            res.status(201).json({ success: true, data: template });
        } catch (error) {
            console.error("Error in uploadTemplate:", error);
            res.status(500).json({ success: false, message: "Internal server error during template upload" });
        }
    }

    static async updateTemplate(req: any, res: Response) {
        try {
            const { id } = req.params;
            const file = req.file;
            const { templateName } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: "Template ID is required" });
            }

            const template = await TemplateService.updateTemplate(Number(id), templateName, file);
            res.status(200).json({ success: true, data: template });
        } catch (error) {
            console.error("Error in updateTemplate:", error);
            res.status(500).json({ success: false, message: "Internal server error during template update" });
        }
    }
}