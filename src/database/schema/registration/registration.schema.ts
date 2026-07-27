import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { workspaces } from "../workspace/workspace.schema";

export const registrations = pgTable("registrations", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
    pfiNumber: varchar("pfi_number", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
