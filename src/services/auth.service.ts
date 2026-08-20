
import { eq, and } from "drizzle-orm";

import { generateToken } from "../utils/jwtHelper";
import { users } from "../database/schema/users/users.schema";
import { db } from "../config/database";
import bcrypt from "bcrypt";
import { generate_OTP } from "../utils/otp-generator";
import { otp_verification } from "../database/schema";
import { sendOTPEmail } from "../utils/mailer";
import { UserStatus } from "../database/enums";

export class AuthService {

    static async register(data: any) {

        // const hashedPassword = await hashPassword(data.password);

        const [user] = await db
            .insert(users)
            .values({
                ...data,
                // password: hashedPassword,
            })
            .returning();

        return user;
    }

    static async login(email: string, password: string) {

        const conditions = [
            eq(users.email, email)
        ];

        const [user] = await db.select().from(users).where(and(...conditions));

        if (!user)
            throw new Error("Invalid Credentials");

        const isValid = await bcrypt.compare(password, user?.password || "");

        if (user.status == UserStatus.INVITED || !user.password) {
            throw new Error("Please activate your account using the invitation email.");
        }

        if (user.status == UserStatus.INACTIVE) {
            throw new Error("Your account has been deactivated. Please contact your administrator.");
        }



        if (!isValid) {
            throw new Error("Invalid Credentials");
        }

        const otp = generate_OTP();

        await db.insert(otp_verification).values({
            userId: user.id,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0
        });

        sendOTPEmail(email, otp)

        return {

            otpRequired: true,
            email: email
        };
    }

}