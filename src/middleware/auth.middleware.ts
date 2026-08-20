import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper.js";
import { db } from "../config/database.js";
import { users } from "../database/schema/index.js";
import { and, eq, } from "drizzle-orm";

export interface AuthRequest extends Request {
    user?: any;
}


export const isAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // const token = req.headers.authorization?.split(" ")[1];
        const token = req.cookies.auth_token
        if (!token) {
            res.status(401).json({ message: "No token provided, authorization denied" });
            return;
        }

        const decoded = verifyToken(token);

        const [user] = await db.select({ role: users.role })
            .from(users)
            .where(and(eq(users.id, decoded.id), eq(users.status, "ACTIVE")));

        if (!user) {
            res.status(401).json({ message: "Token is not valid" });
            return;
        }
        req.user = { ...decoded, role: user?.role };
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};