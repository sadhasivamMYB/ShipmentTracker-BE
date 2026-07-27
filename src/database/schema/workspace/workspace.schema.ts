import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const workspaces = pgTable("workspaces", {
    id: serial("id").primaryKey(),
    year: integer("year").notNull(),
    month: varchar("month", { length: 20 }).notNull(),
    status: varchar("status", { length: 50 }).default("Pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
