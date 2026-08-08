import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller";
import { isAuth } from "../middleware/auth.middleware";
import { TemplateController } from "../controllers/template.controller";
import { isAdmin } from "../middleware/isAdmin.middleware";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "file") {
            cb(null, "uploads/");
        } else if (file.fieldname === "template") {
            cb(null, "templates/");
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

export default router;
