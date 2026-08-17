import { eq } from "drizzle-orm";
import { db } from "../config/database";
import { users } from "../database/schema/users/users.schema";
import bcrypt from "bcrypt";

export class UsersService {
    static async getAllUsers() {
        const result = await db.select().from(users);
        return result.map((u: any) => ({
            id: u.id,
            name: u.fullName,
            email: u.email,
            role: u.role,
            isActive: u.isActive
        }));
    }

    static async createUser(data: { name: string, email: string, role: string, isActive?: boolean }) {
        // Generating a default hashed password for new users
        const defaultPassword = "Password@123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const [user] = await db
            .insert(users)
            .values({
                fullName: data.name,
                email: data.email,
                role: data.role,
                isActive: data.isActive ?? true,
                password: hashedPassword,
            })
            .returning();

        return {
            id: user?.id,
            name: user?.fullName,
            email: user?.email,
            role: user?.role,
            isActive: user?.isActive
        };
    }

    static async updateUser(id: number, data: { name: string, email: string, role: string, isActive: boolean }) {
        const [user] = await db
            .update(users)
            .set({
                fullName: data.name,
                email: data.email,
                role: data.role,
                isActive: data.isActive,
            })
            .where(eq(users.id, id))
            .returning();

        if (!user) {
            throw new Error("User not found");
        }

        return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        };
    }

    static async deleteUser(id: number) {
        const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
        if (!deleted) {
            throw new Error("User not found");
        }
        return deleted;
    }
}
