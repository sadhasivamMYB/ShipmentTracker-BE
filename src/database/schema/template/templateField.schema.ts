import { pgTable, text, boolean, integer, serial, timestamp } from "drizzle-orm/pg-core";

export const templateField = pgTable('template_field', {
    id: serial().primaryKey(),
    template_id: integer().notNull(),
    field_name: text().notNull(),
    field_label: text().notNull(),
    field_type: text().notNull(),
    required: boolean().notNull(),
    default_value: text(),
    order: integer().notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp().defaultNow().notNull(),
})