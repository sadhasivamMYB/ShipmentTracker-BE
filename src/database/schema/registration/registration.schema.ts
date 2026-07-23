import {
    pgTable,
    uuid,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";

import { workspaces } from "../workspace/workspace.schema";

export const registrations = pgTable("registrations", {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: uuid("workspace_id")
        .references(() => workspaces.id)
        .notNull(),

    pfi: varchar("pfi", { length: 100 }).notNull(),

    status: varchar("status", { length: 20 })
        .$default(() => "IN_PROGRESS")
        .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});