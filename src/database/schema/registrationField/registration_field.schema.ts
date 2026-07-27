import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { registrations } from "../registration/registration.schema";
import { fieldDefinitions } from "../fieldDefinition/field_definition.schema";
import { documentUploads } from "../documentUpload/document_upload.schema";

export const registrationFields = pgTable("registration_fields", {
    id: serial("id").primaryKey(),
    registrationId: integer("registration_id").references(() => registrations.id, { onDelete: 'cascade' }).notNull(),
    fieldDefinitionId: integer("field_definition_id").references(() => fieldDefinitions.id).notNull(),
    documentUploadId: integer("document_upload_id").references(() => documentUploads.id, { onDelete: 'cascade' }).notNull(),
    extractedValue: varchar("extracted_value", { length: 500 }),
    extractedAt: timestamp("extracted_at").defaultNow().notNull(),
});
