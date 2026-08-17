import {
    pgTable,
    serial,
    varchar,
    integer,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";


export const users = pgTable("users", {
    id: serial("id").primaryKey(),

    fullName: varchar("full_name", { length: 150 }).notNull(),

    email: varchar("email", { length: 255 })
        .unique()
        .notNull(),

    password: varchar("password", { length: 255 }).notNull(),

    role: varchar("role", { length: 30 }).notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});