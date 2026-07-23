import {
    pgTable,
    uuid,
    varchar,
    boolean,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";

export const documentTypes = pgTable("document_types", {
    id: uuid("id").defaultRandom().primaryKey(),

    /**
     * Internal name
     * Example:
     * ORDER
     * INSURANCE
     * BL
     * FORM_M
     */
    code: varchar("code", { length: 50 })
        .unique()
        .notNull(),

    /**
     * Display Name
     * Example:
     * Order
     * Insurance
     * Bill of Lading
     */
    name: varchar("name", { length: 100 }).notNull(),

    /**
     * Upload order in UI
     */
    displayOrder: integer("display_order")
        .default(1)
        .notNull(),

    isRequired: boolean("is_required")
        .default(false)
        .notNull(),

    isActive: boolean("is_active")
        .default(true)
        .notNull(),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at")
        .$onUpdate(() => new Date())
        .defaultNow()
        .notNull(),
});