
import { eq, and, isNull, lt } from "drizzle-orm";
import { userInvitations } from "../../database/schema";
import { db } from "../../config/database";

export class InvitationRepository {
    static async findByTokenHash(tokenHash: string) {
        const [invitation] = await db
            .select()
            .from(userInvitations)
            .where(eq(userInvitations.tokenHash, tokenHash))
            .limit(1);

        return invitation || null;
    }

    static async invalidateUserInvitations(userId: number, tx?: any) {
        const database = tx || db;
        await database
            .update(userInvitations)
            .set({ usedAt: new Date() })
            .where(
                and(
                    eq(userInvitations.userId, userId),
                    isNull(userInvitations.usedAt)
                )
            );
    }

    static async createInvitation(data: { userId: number; tokenHash: string; expiresAt: Date }, tx?: any) {
        const database = tx || db;
        const [invitation] = await database
            .insert(userInvitations)
            .values({
                userId: data.userId,
                tokenHash: data.tokenHash,
                expiresAt: data.expiresAt,
            })
            .returning();

        return invitation;
    }

    static async deleteOldInvitations(olderThan: Date) {
        await db
            .delete(userInvitations)
            .where(lt(userInvitations.createdAt, olderThan));
    }
}
