import { test } from "node:test";
import assert from "node:assert/strict";

// Set before anything is imported: the bug this guards against ran at module
// load, so a test that imports first and sets the env afterwards cannot see it.
// node:test runs each file in its own process, so this does not leak.
Object.assign(process.env, {
  NODE_ENV: "production",
  ADMIN_PASSWORD: "admin123",
  ADMIN_JWT_SECRET: "short",
  DATABASE_URL: "postgresql://ci:ci@localhost:5432/ci",
});

test("a bad admin env does not stop public routes, or the admin guards, from loading", async () => {
  for (const mod of ["@/app/api/shop/orders/route", "@/app/api/chat/start/route", "@/proxy", "@/lib/auth/requireAdmin"]) {
    await assert.doesNotReject(import(mod), `${mod} failed to load`);
  }
});
