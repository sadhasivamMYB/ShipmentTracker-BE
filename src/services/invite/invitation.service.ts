
// import { userInvitations } from "../models/schema/users/userInvitations.schema";

import { InvitationRepository } from "../repository/invitation.repository";


import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../../config/database";
import { userInvitations, users } from "../../database/schema";
import { UserStatus } from "../../database/enums";
import { generateSecureToken, hashToken } from "../../utils/token";
import { sendInvitationEmail } from "../../utils/mailer";

export class InvitationService {
    static async inviteUser(data: { email: string; fullName?: string; role: string; warehouseId?: number }) {
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, data.email),
        });

        if (existingUser) {
            if (existingUser.status === UserStatus.ACTIVE) {
                throw new Error("User already exists and is active.");
            }
            if (existingUser.status === UserStatus.INVITED) {
                throw new Error("User has already been invited. Use resend invitation if needed.");
            }
        }

        const { rawToken, tokenHash } = generateSecureToken();

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const fullName = data?.fullName as string;

        const newUser = await db.transaction(async (tx) => {
            const [createdUser] = await tx
                .insert(users)
                .values({
                    fullName,
                    email: data.email,
                    password: null,
                    role: data.role,
                    status: UserStatus.INVITED
                })
                .returning();

            if (!createdUser) {
                throw new Error("Failed to create user");
            }

            await InvitationRepository.createInvitation(
                {
                    userId: createdUser.id,
                    tokenHash,
                    expiresAt,
                },
                tx
            );

            return createdUser;
        });
        try {
            await sendInvitationEmail(data.email, rawToken);

            return {
                success: true,
                data: newUser,
                message: "Invitation email sent successfully."
            };
        } catch (err) {
            // Rollback the created user since email failed
            await db.delete(users).where(eq(users.id, newUser.id));
            throw new Error("Failed to send invitation email. Please try again.");
        }

    }


    static async activateAccount(data: { token: string; password: string }) {
        const tokenHash = hashToken(data.token);

        const invitation = await InvitationRepository.findByTokenHash(tokenHash);

        if (!invitation) {
            throw new Error("Invalid or missing invitation token.");
        }

        if (invitation.usedAt) {
            throw new Error("This invitation has already been used.");
        }

        if (new Date() > new Date(invitation.expiresAt)) {
            throw new Error("Invitation token has expired. Please ask an administrator for a new invitation.");
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        await db.transaction(async (tx) => {
            await tx
                .update(users)
                .set({
                    password: passwordHash,
                    status: UserStatus.ACTIVE,

                })
                .where(eq(users.id, invitation.userId));

            await tx
                .update(userInvitations)
                .set({
                    usedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(userInvitations.id, invitation.id));
        });

        return { message: "Account activated successfully." };
    }

    static async resendInvitation(userId: number) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw new Error("User not found.");
        }

        if (user.status === UserStatus.ACTIVE) {
            throw new Error("User is already active.");
        }

        const { rawToken, tokenHash } = generateSecureToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.transaction(async (tx) => {
            await InvitationRepository.invalidateUserInvitations(userId, tx);

            await InvitationRepository.createInvitation(
                {
                    userId,
                    tokenHash,
                    expiresAt,
                },
                tx
            );
        });

        try {
            await sendInvitationEmail(user.email, rawToken);
        } catch (err) {
            throw new Error("Failed to send invitation email. Please try again.");
        }

        return { message: "Invitation resent successfully." };
    }
}
