import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/database/schema/index.ts",
    out: "./src/database/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgres://postgres:sadha123@localhost:5432/shipment_tracker",
    },
});