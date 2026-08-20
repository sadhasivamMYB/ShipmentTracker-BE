import type { Request, Response } from "express";

import { AuthService } from "../services/auth.service";
import { users } from "../database/schema";
import { db } from "../config/database";
import { eq } from "drizzle-orm";

export class AuthController {

    static async register(req: Request, res: Response) {
        try {
            const user = await AuthService.register(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message || "Registration failed" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const data = await AuthService.login(
                req.body.email,
                req.body.password
            );
            res.json(data);
        } catch (error: any) {
            res.status(401).json({ message: error.message || "Invalid Credentials" });
        }
    }

    static async me(req: any, res: Response) {
        try {
            const user = await db.query.users.findFirst({
                where: eq(users.id, req.user.id),
                columns: {
                    password: false,
                }
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ user });

        } catch (error: any) {
            res.status(500).json({ message: "Failed to fetch user profile" });
        }
    }

    static async logout(req: Request, res: Response) {
        // Clear the auth_token cookie.
        // Note: ensure you match the exact same options (secure, sameSite) you used when creating it!
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });

        res.status(200).json({ message: "Logged out successfully" });
    };


}