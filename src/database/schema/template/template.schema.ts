import { pgTable, serial, timestamp, text, integer } from "drizzle-orm/pg-core";


export const template = pgTable('template', {
    id: serial().primaryKey(),
    name: text().notNull(),
    file_path: text().notNull(),
    created_by: integer().notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp().defaultNow().notNull(),
})