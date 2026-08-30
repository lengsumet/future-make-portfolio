import { PrismaClient } from "@prisma/client";
import path from "node:path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Where the client should connect.
 *
 * An explicit DATABASE_URL always wins — that is the path to Postgres later.
 * Without one this falls back to the SQLite file the build seeds, because the
 * variable lives only in .env files that are correctly not committed, so the
 * deployment never had it and every query failed with "Environment variable
 * not found: DATABASE_URL" — a 500 on /api/shop/products, which is why the
 * shop showed nothing.
 *
 * The path is absolute. A relative `file:./dev.db` resolves against the
 * schema's directory as recorded when the client was generated, which is not
 * where a serverless function runs from.
 */
function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL;
  if (configured) return configured;
  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({ datasources: { db: { url: resolveDatabaseUrl() } } });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
