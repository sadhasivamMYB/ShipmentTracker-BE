import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller";
import { isAuth } from "../middleware/auth.middleware";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

router.use(isAuth); // Protect upload routes

router.post("/", upload.single("file"), UploadController.uploadDocument);

export default router;
