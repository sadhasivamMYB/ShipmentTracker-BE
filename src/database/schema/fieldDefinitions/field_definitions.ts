import {
    pgTable,
    uuid,
    varchar,
    boolean,
    integer,
    timestamp,
    text,
} from "drizzle-orm/pg-core";

import { documentTypes } from "../documentType/document_type.schema";

export const fieldDefinitions = pgTable("field_definitions", {
    id: uuid("id").defaultRandom().primaryKey(),

    documentTypeId: uuid("document_type_id")
        .references(() => documentTypes.id)
        .notNull(),

    /**
     * OCR Field Name
     * Example:
     * "PFI Number"
     * "Insurance Number"
     */
    sourceField: varchar("source_field", {
        length: 150,
    }).notNull(),

    /**
     * Internal key
     * Example:
     * pfi
     * sku
     * insuranceNumber
     */
    fieldKey: varchar("field_key", {
        length: 100,
    }).notNull(),

    /**
     * Summary table column
     */
    summaryColumn: varchar("summary_column", {
        length: 100,
    }).notNull(),

    /**
     * string
     * number
     * date
     * boolean
     */
    dataType: varchar("data_type", {
        length: 20,
    }).default("string"),

    /**
     * Required field?
     */
    isRequired: boolean("is_required")
        .default(false)
        .notNull(),

    /**
     * Column position
     */
    displayOrder: integer("display_order")
        .default(1)
        .notNull(),

    /**
     * Default value if OCR doesn't find it
     */
    defaultValue: text("default_value"),

    isActive: boolean("is_active")
        .default(true)
        .notNull(),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
});