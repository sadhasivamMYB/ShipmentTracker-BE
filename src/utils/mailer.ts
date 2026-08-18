import nodemailer from "nodemailer"
import { eq } from "drizzle-orm";
import { userInvitations } from "../database/schema/userInvite/user-invite";
import { users } from "../database/schema/users/users.schema";
import { db } from "../config/database";


const frontendUrl = process.env.FRONTEND_URL;
const fromAddress = process.env.MAIL_FROM;
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,

    },
});

export const sendInvitationEmail = async (to: string, rawToken: string) => {

    const activationLink = `${frontendUrl}/activate-account?token=${rawToken}`;


    const [user_nameFromToken] = await db.select({ fullName: users.fullName })
        .from(userInvitations)
        .innerJoin(users, eq(userInvitations.userId, users.id))
        .where(eq(users.email, to))


    const mailOptions = {
        from: fromAddress,
        to,
        subject: "Welcome to Shipment Tracker - Activate Your Account",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333;">Welcome to Shipment Tracker</h2>
                <p>Hello, ${user_nameFromToken?.fullName} </p>
                <p>You have been added as a user in Shipment Tracker. Your account has been created successfully by the administrator.</p>
                <p>To activate your account and set up your password, please click the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${activationLink}" style="background-color: #00861bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Activate Account</a>
                </div>
                <p>Or copy and paste this URL into your browser:</p>
                <p style="word-break: break-all; color: #555;"><a href="${activationLink}">${activationLink}</a></p>
                <p style="color: #888; font-size: 13px;">This invitation link will expire in 24 hours. If you did not expect this invitation, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">Shipment Tracker Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invitation email sent to ${to}`);
    } catch (err: any) {
        console.error(`Failed to send invitation email to ${to}:`, err.message);
        // Non-blocking error
    }
};


export const sendOTPEmail = async (to: string, otp: any) => {

    const [user_name] = await db.select({ fullName: users.fullName })
        .from(users)
        .where(eq(users.email, to))

    const mailOptions = {
        from: fromAddress,
        to,
        subject: "Shipment Tracker - Verify Your OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333;">Welcome to Shipment Tracker</h2>
                <p>Hello, ${user_name?.fullName} </p>
                <p>Your OTP for login is: <strong> ${otp} </strong></p>
                <p>This OTP will expire in 5 minutes. If you did not expect this OTP, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">Shipment Tracker Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${to}`);
    } catch (err: any) {
        console.error(`Failed to send OTP email to ${to}:`, err.message);
        // Non-blocking error
    }
}
