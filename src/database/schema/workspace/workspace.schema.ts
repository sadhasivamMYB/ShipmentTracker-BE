import {
    pgTable,
    uuid,
    integer,
    varchar,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

export const workspaces = pgTable(
    "workspaces",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        year: integer("year").notNull(),

        month: integer("month").notNull(), // 1-12

        status: varchar("status", { length: 20 })
            .$default(() => "OPEN")
            .notNull(),

        createdAt: timestamp("created_at").defaultNow().notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => ({
        workspaceUnique: unique().on(table.year, table.month),
    })
);