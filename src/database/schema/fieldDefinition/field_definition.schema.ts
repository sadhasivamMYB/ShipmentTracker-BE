import { pgTable, serial, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { documentTypes } from "../documentType/document_type.schema";

export const fieldDefinitions = pgTable("field_definitions", {
    id: serial("id").primaryKey(),
    documentTypeId: integer("document_type_id").references(() => documentTypes.id).notNull(),
    fieldName: varchar("field_name", { length: 100 }).notNull(),
    fieldType: varchar("field_type", { length: 50 }).notNull(), // string, number, date
    isRequired: boolean("is_required").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
