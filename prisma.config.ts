import "dotenv/config";
import { defineConfig } from "prisma/config";

// Force a local fallback string so Prisma can ALWAYS see the database
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/pjdb?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
  },
});