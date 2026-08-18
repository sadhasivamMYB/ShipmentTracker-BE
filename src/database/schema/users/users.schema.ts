import {
    pgTable,
    serial,
    varchar,
    integer,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";
import { UserStatus } from "../../enums";


export const users = pgTable("users", {
    id: serial("id").primaryKey(),

    fullName: varchar("full_name", { length: 150 }).notNull(),

    email: varchar("email", { length: 255 })
        .unique()
        .notNull(),

    password: varchar("password", { length: 255 }),

    role: varchar("role", { length: 30 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),



    status: varchar("status", { length: 20 }).default(UserStatus.ACTIVE).notNull(),
});