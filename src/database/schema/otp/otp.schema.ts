import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const otp_verification = pgTable("otp_verification", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    otp: text("otp").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});


