import type { Request, Response } from "express";
import { UsersService } from "../services/users.service";
import { CreateUserSchema, UpdateUserSchema } from "../zod/user.zod";
import { z } from "zod";

export class UsersController {
    static async getAll(req: Request, res: Response) {
        try {
            const users = await UsersService.getAllUsers();
            res.json(users);
        } catch (error: any) {
            res.status(500).json({ message: error.message || "Failed to fetch users" });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const validatedData = CreateUserSchema.parse(req.body);
            const user = await UsersService.createUser(validatedData);
            res.status(201).json(user);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Validation error", errors: error.issues });
            }
            res.status(400).json({ message: error.message || "Failed to create user" });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = req.params?.id;
            if (!id) {
                return res.status(400).json({ message: "Invalid user ID" });
            }
            const validatedData = UpdateUserSchema.parse(req.body);
            const user = await UsersService.updateUser(id as any, validatedData);
            res.json(user);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: "Validation error", errors: error.issues });
            }
            res.status(400).json({ message: error.message || "Failed to update user" });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = req.params?.id;
            if (!id) {
                return res.status(400).json({ message: "Invalid user ID" });
            }
            await UsersService.deleteUser(id as any);
            res.json({ message: "User deleted successfully" });
        } catch (error: any) {
            res.status(400).json({ message: error.message || "Failed to delete user" });
        }
    }
}
