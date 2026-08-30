import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

/**
 * Apply migrations and seed the catalogue, before `next build`.
 *
 * The shop reads its products from the database, not from
 * public/data/products.json — the JSON is what seeds it. The database file
 * used to be committed, so deployments happened to carry one; it no longer is,
 * and without this step the deployed shop is simply empty.
 *
 * DATABASE_URL is defaulted rather than required. Its value for SQLite is a
 * path, not a credential, and leaving it unset is what breaks a build on a host
 * where nobody thought to add it. An explicit value still wins, which is how
 * this moves to Postgres later without touching the script.
 */
process.env.DATABASE_URL ??= "file:./dev.db";

/*
  Prisma's own JS entry, run with this node — not `npx`. On Windows npx
  resolves to npx.cmd, which execFileSync refuses to spawn on Node 20 (EINVAL),
  and reaching for `shell: true` to get around that invites quoting bugs on a
  build server for no gain.
*/
const prismaCli = createRequire(import.meta.url).resolve("prisma/build/index.js");
const run = (args) =>
  execFileSync(process.execPath, [prismaCli, ...args], {
    stdio: "inherit",
    env: process.env,
  });

console.log(`[prepare-db] DATABASE_URL=${process.env.DATABASE_URL}`);

// `migrate deploy` and not `migrate dev`: it applies what is committed and
// never invents a migration or resets on drift, which is the only safe
// behaviour on a build server.
run(["migrate", "deploy"]);

if (!existsSync("prisma/seed.ts")) {
  console.error("[prepare-db] prisma/seed.ts is missing — refusing to build an empty catalogue");
  process.exit(1);
}

run(["db", "seed"]);
console.log("[prepare-db] done");
