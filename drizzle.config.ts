import { defineConfig } from "drizzle-kit";
import * as path from "path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bingo.db");

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});
