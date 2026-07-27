import { pgTable, serial, varchar, integer, timestamp, text } from "drizzle-orm/pg-core";
import { workspaces } from "../workspace/workspace.schema";
import { documentTypes } from "../documentType/document_type.schema";
import { users } from "../users/users.schema";

export const documentUploads = pgTable("document_uploads", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
    documentTypeId: integer("document_type_id").references(() => documentTypes.id).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    filePath: varchar("file_path", { length: 500 }).notNull(),
    extractedText: text("extracted_text"),
    matchedKey: varchar("matched_key", { length: 100 }),
    status: varchar("status", { length: 50 }).default("uploaded").notNull(),
    uploadedBy: integer("uploaded_by").references(() => users.id),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
