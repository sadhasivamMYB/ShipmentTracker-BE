import { pgTable, serial, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const documentStatusEnum = pgEnum("document_status", ["active", "inactive"]);

export const documentTypes = pgTable("document_types", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    documentCode: varchar("document_code", { length: 50 }).notNull().unique(),
    description: varchar("description", { length: 255 }),
    status: documentStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
