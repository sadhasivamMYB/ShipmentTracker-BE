import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller";
import { isAuth } from "../middleware/auth.middleware";
import { TemplateController } from "../controllers/template.controller";
import { isAdmin } from "../middleware/isAdmin.middleware";
import { DownloadPdfController } from "../controllers/downloadPdf.controller";
import fs from "fs"

const router = Router();

if (!fs.existsSync("uploads/")) {
    fs.mkdirSync("uploads/", { recursive: true });
}

if (!fs.existsSync("templates/")) {
    fs.mkdirSync("templates/", { recursive: true });
}

if (!fs.existsSync("templates/generated")) {
    fs.mkdirSync("templates/generated", { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "file") {
            cb(null, "uploads/");
        } else if (file.fieldname === "template") {

            cb(null, 'templates');
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === "file") {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
        } else if (file.fieldname === "template") {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
        }
    }
});

const upload = multer({ storage });

router.use(isAuth); // Protect upload routes

router.post("/", upload.single("file"), isAdmin, UploadController.uploadDocument);
router.get("/download/:workspaceId/:documentType/:referenceKey/:referenceValue", DownloadPdfController.downloadPdf);

export default router;
