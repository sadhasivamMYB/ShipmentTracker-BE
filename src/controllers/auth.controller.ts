import type { Request, Response } from "express";

import { AuthService } from "../services/auth.service";

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

    static async profile(req: any, res: Response) {
        res.json(req.user);
    }

}