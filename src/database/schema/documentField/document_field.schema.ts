import { pgTable, serial, varchar, integer, timestamp, text } from "drizzle-orm/pg-core";
import { documentUploads } from "../documentUpload/document_upload.schema";

export const documentFields = pgTable("document_fields", {
    id: serial("id").primaryKey(),
    documentId: integer("document_id").references(() => documentUploads.id, { onDelete: 'cascade' }).notNull(),
    fieldName: varchar("field_name", { length: 100 }).notNull(),
    fieldValue: text("field_value"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
