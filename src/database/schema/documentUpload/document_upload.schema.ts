import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";

import { registrations } from "../registration/registration.schema";
import { users } from "../users/users.schema";

export const documentUploads = pgTable(
    "document_uploads",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        registrationId: uuid("registration_id")
            .references(() => registrations.id)
            .notNull(),

        documentType: varchar("document_type", {
            length: 50,
        }).notNull(),

        // version: integer("version")
        //     .default(1)
        //     .notNull(),

        fileName: varchar("file_name", {
            length: 255,
        }).notNull(),

        filePath: varchar("file_path", {
            length: 500,
        }).notNull(),

        uploadedBy: integer("uploaded_by").references(() => users.id),

        uploadedAt: timestamp("uploaded_at")
            .defaultNow()
            .notNull(),
    }
);