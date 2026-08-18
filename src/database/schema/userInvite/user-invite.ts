import {
    pgTable,
    serial,
    integer,
    varchar,
    timestamp,
} from "drizzle-orm/pg-core";
import { users } from "../users/users.schema";

export const userInvitations = pgTable("user_invitations", {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),

    tokenHash: varchar("token_hash", { length: 255 }).notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    usedAt: timestamp("used_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
