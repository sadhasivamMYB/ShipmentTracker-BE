import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { isAuth } from "../middleware/auth.middleware";
import { LoginLimiter, resendOTPLimiter, VerifyOTPLimiter } from "../utils/rateLimiters";
import { OtpController } from "../controllers/otp.controller";
import { InviteController } from "../controllers/invite.controller";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", LoginLimiter, AuthController.login);
router.get("/profile", isAuth, AuthController.profile);
router.post("/verify/otp", VerifyOTPLimiter, OtpController.verifyOTP)
router.post("/resend/otp", resendOTPLimiter, OtpController.resendOTP)
router.post("/activate-account", InviteController.activateAccount);

export default router;
