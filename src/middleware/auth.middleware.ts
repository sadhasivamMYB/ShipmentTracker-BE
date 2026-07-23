import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper.js";

export interface AuthRequest extends Request {
    user?: any;
}

export const isAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "No token provided, authorization denied" });
            return;
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
