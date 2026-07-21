import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Ensure this uses the correct local URL fallback as well
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/pjdb?schema=public";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });