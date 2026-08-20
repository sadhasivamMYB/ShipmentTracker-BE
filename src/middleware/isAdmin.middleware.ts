import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper";

export interface AuthRequest extends Request {
    user?: any;
}


export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        // const token = req.headers.authorization?.split(" ")[1];
        const token = req.cookies.auth_token
        if (!token) {
            res.status(401).json({ message: "No token provided, authorization denied" });
            return;
        }



        const decoded = verifyToken(token);
        req.user = decoded;
        if (decoded.role !== "admin") {
            res.status(403).json({ message: "Unauthorized: Admin access required" });
            return;
        }
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};
