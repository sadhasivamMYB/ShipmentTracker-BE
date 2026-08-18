import { z } from "zod";

export const CreateUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(150),
    email: z.string().email("Invalid email address").max(255),
    role: z.string().min(1, "Role is required").max(30),
    status: z.enum(["INVITED", "ACTIVE", "INACTIVE"]).optional(),
});

export const UpdateUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(150),
    email: z.string().email("Invalid email address").max(255),
    role: z.string().min(1, "Role is required").max(30),
    status: z.enum(["INVITED", "ACTIVE", "INACTIVE"]),
});
