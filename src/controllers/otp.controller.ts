import { and, asc, desc, eq } from "drizzle-orm";

import { Request, Response } from "express";
import { generateToken } from "../utils/jwtHelper";
import { db } from "../config/database";
import { users } from "../database/schema";
import { otp_verification } from "../database/schema/otp/otp.schema";
import { generate_OTP } from "../utils/otp-generator";
import { sendOTPEmail } from "../utils/mailer"



export class OtpController {

    static async verifyOTP(req: Request, res: Response) {
        try {
            const body: any = req.body;

            const user = await db.query.users.findFirst({
                where: eq(users.email, body.email),
            });

            if (!user)
                throw new Error("Invalid Credentials");

            const otpVerification = await db.query.otp_verification.findFirst({
                where: eq(otp_verification.userId, user.id),
                orderBy: [desc(otp_verification.expiresAt)]
            });

            if (!otpVerification)
                throw new Error("Invalid Credentials");

            if (otpVerification.attempts >= 3) {
                await db.delete(otp_verification).where(eq(otp_verification.id, otpVerification.id));
                throw new Error("Too many OTP attempts. Please try again later.");
            }

            if (otpVerification.otp !== body.otp) {
                await db.update(otp_verification).set({
                    attempts: otpVerification.attempts + 1,
                }).where(eq(otp_verification.id, otpVerification.id));
                throw new Error("Wrong OTP");
            }

            if (otpVerification.expiresAt < new Date()) {
                await db.delete(otp_verification).where(eq(otp_verification.id, otpVerification.id));
                throw new Error("OTP Expired");
            }



            await db.update(otp_verification).set({
                verified: true,
                attempts: otpVerification.attempts + 1,
            }).where(and(eq(otp_verification.userId, user.id), eq(otp_verification.otp, body.otp)));

            const token = generateToken({
                id: user.id,
                warehouseId: user.id,
                role: user.role,
            });

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            });

            res.json({
                success: true,
                message: "OTP verified successfully",
                // data: {
                //     token,
                //     user: user
                // }
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "OTP verification failed"
            });
        }
    }

    static async resendOTP(req: Request, res: Response) {
        try {
            const body: any = req.body;
            const user = await db.query.users.findFirst({
                where: eq(users.email, body.email),
            });
            if (!user)
                throw new Error("Invalid Credentials");

            const otp = generate_OTP();

            await db.insert(otp_verification).values({
                userId: user.id,
                otp,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                attempts: 0
            });

            sendOTPEmail(body.email, otp);

            res.json({
                success: true,
                message: "OTP resent successfully"
            })

        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "OTP resend failed"
            });
        }
    }

}