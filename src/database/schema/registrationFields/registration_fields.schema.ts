import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

import { registrations } from "../registration/registration.schema";
import { documentTypes } from "../documentType/document_type.schema";

export const registrationFields = pgTable(
    "registration_fields",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        registrationId: uuid("registration_id")
            .references(() => registrations.id)
            .notNull(),

        documentTypeId: uuid("document_type_id")
            .references(() => documentTypes.id)
            .notNull(),

        fieldKey: varchar("field_key", {
            length: 100,
        }).notNull(),

        fieldValue: text("field_value"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
    }
);