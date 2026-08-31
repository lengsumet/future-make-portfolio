import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * DATABASE_URL is required, with no fallback.
 *
 * There was one while the catalogue lived in a SQLite file the build produced:
 * the value was a path, not a credential, and defaulting it was better than a
 * deployment that 500s because nobody set the variable. Now that it points at
 * Postgres there is nothing safe to guess — a wrong guess either fails or
 * writes to somebody else's database.
 */
export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
