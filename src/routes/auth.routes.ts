import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { isAuth } from "../middleware/auth.middleware";
import { LoginLimiter } from "../utils/rateLimiters";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", LoginLimiter, AuthController.login);
router.get("/profile", isAuth, AuthController.profile);

export default router;
