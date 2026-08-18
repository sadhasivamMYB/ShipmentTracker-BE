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

router.use(isAdmin);
router.get("/", TemplateController.getAllTemplates);
router.post("/upload", upload.single("template"), TemplateController.uploadTemplateDocument);
router.get("/:template_id", TemplateController.selectedTemplate);
router.put("/:id", upload.single("template"), TemplateController.updateTemplate);
router.post("/:template_id/render", TemplateController.renderTemplate);
router.delete("/:id", TemplateController.deleteTemplate);

export default router;