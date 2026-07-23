import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as index from "../database/schema/index"

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}
const client = postgres(connectionString);

export const db = drizzle(client, { schema: index });


export async function testConnection() {
    try {
        await db.query.users.findFirst();
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}