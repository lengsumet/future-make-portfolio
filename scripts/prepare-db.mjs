import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";

/**
 * Apply migrations and seed the catalogue, before `next build`.
 *
 * The shop reads its products from the database, not from
 * public/data/products.json — the JSON is what seeds it, so without this step
 * the deployed shop is simply empty.
 */

/*
  Read the .env files the way Prisma and Next both do, because npm does not:
  a real environment variable wins, then .env.local, then .env. Without this
  the check below fires on a developer machine where the value is sitting in a
  file two lines away.
*/
for (const file of [".env.local", ".env"]) {
  if (process.env.DATABASE_URL || !existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (line.trimStart().startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1 || line.slice(0, eq).trim() !== "DATABASE_URL") continue;
    process.env.DATABASE_URL = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    break;
  }
}

/*
  Required, with no fallback. There was one while the catalogue lived in a
  SQLite file this script produced: the value was a path, not a credential, and
  defaulting it beat a deployment that 500s because nobody set the variable.
  Pointing at Postgres there is nothing safe to guess — a wrong guess either
  fails, or seeds somebody else's database.
*/
if (!process.env.DATABASE_URL) {
  console.error("[prepare-db] DATABASE_URL is not set — refusing to guess a connection string.");
  process.exit(1);
}

/*
  Prisma's own JS entry, run with this node — not `npx`. On Windows npx
  resolves to npx.cmd, which execFileSync refuses to spawn on Node 20 (EINVAL),
  and reaching for `shell: true` to get around that invites quoting bugs on a
  build server for no gain.
*/
const prismaCli = createRequire(import.meta.url).resolve("prisma/build/index.js");
const run = (args) =>
  execFileSync(process.execPath, [prismaCli, ...args], { stdio: "inherit", env: process.env });

console.log("[prepare-db] applying migrations");
/*
  `migrate deploy`, never `migrate dev`: it applies what is committed and will
  not invent a migration or reset on drift. That is the only safe behaviour on
  a build server, and doubly so here — this database carries another system's
  schema alongside ours.
*/
run(["migrate", "deploy"]);

if (!existsSync("prisma/seed.ts")) {
  console.error("[prepare-db] prisma/seed.ts is missing — refusing to build an empty catalogue");
  process.exit(1);
}

run(["db", "seed"]);
console.log("[prepare-db] done");
