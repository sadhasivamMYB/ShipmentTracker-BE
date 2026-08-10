import express from "express";
import multer from "multer";
import { TemplateController } from "../controllers/template.controller";
import { isAdmin } from "../middleware/isAdmin.middleware";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "templates/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.get("/", isAdmin, TemplateController.getAllTemplates);
router.post("/upload", isAdmin, upload.single("template"), TemplateController.uploadTemplateDocument);
router.get("/:template_id", isAdmin, TemplateController.selectedTemplate);
router.put("/:id", isAdmin, upload.single("template"), TemplateController.updateTemplate);
router.post("/:template_id/render", isAdmin, TemplateController.renderTemplate);

export default router;