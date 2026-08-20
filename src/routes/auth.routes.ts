import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { isAuth } from "../middleware/auth.middleware";
import { LoginLimiter, resendOTPLimiter, VerifyOTPLimiter } from "../utils/rateLimiters";
import { OtpController } from "../controllers/otp.controller";
import { InviteController } from "../controllers/invite.controller";

const router = Router();

router.get("/me", isAuth, AuthController.me);
router.post("/register", AuthController.register);
router.post("/login", LoginLimiter, AuthController.login);
router.post("/verify/otp", VerifyOTPLimiter, OtpController.verifyOTP)
router.post("/resend/otp", resendOTPLimiter, OtpController.resendOTP)
router.post("/activate-account", InviteController.activateAccount);
router.post('/logout', AuthController.logout);

export default router;
