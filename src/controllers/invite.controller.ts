import { Request, Response } from "express";
import { InvitationService } from "../services/invite/invitation.service";


export class InviteController {
    static async inviteUser(req: Request, res: Response) {
        try {
            const user = await InvitationService.inviteUser(req.body);
            return res.status(201).json({
                success: true,
                message: "Invitation sent successfully",
                data: user,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to invite user",
            });
        }
    }

    static async activateAccount(req: Request, res: Response) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Token and password are required",
                });
            }

            const result = await InvitationService.activateAccount({ token, password });
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Activation failed",
            });
        }
    }

    static async resendInvitation(req: Request, res: Response) {
        try {
            const userId = Number(req.params.id);
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "Valid User ID is required",
                });
            }

            const result = await InvitationService.resendInvitation(userId);
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to resend invitation",
            });
        }
    }
}
