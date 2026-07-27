import { db } from "../../config/database";
import { sql } from "drizzle-orm";

async function dropAll() {
    try {
        console.log("Dropping tables...");
        await db.execute(sql`DROP TABLE IF EXISTS "registration_fields" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "registrations" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "document_uploads" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "field_definitions" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "document_types" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "workspaces" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);
        console.log("Tables dropped.");
        process.exit(0);
    } catch (e) {
        console.error("Error dropping tables", e);
        process.exit(1);
    }
}
dropAll();
