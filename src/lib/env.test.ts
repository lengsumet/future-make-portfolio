import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { requireSecret } from "./env";

const saved = { ...process.env };
afterEach(() => {
  for (const key of ["NODE_ENV", "ADMIN_JWT_SECRET", "ADMIN_PASSWORD"]) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

// NODE_ENV is typed read-only; tests need to flip it.
const setEnv = (env: Record<string, string>) => Object.assign(process.env, env);
const STRONG = "k".repeat(16) + "-not-a-default-" + "q".repeat(16);

test("production refuses a short ADMIN_JWT_SECRET", () => {
  setEnv({ NODE_ENV: "production", ADMIN_JWT_SECRET: "too-short" });
  assert.throws(() => requireSecret("ADMIN_JWT_SECRET"), /at least 32 characters/);
});

test("production refuses a known default ADMIN_JWT_SECRET even when long enough", () => {
  setEnv({ NODE_ENV: "production", ADMIN_JWT_SECRET: "change-me-to-a-long-random-string-32chars" });
  assert.throws(() => requireSecret("ADMIN_JWT_SECRET"), /known default/);
});

test("production refuses the default ADMIN_PASSWORD", () => {
  setEnv({ NODE_ENV: "production", ADMIN_PASSWORD: "admin123" });
  assert.throws(() => requireSecret("ADMIN_PASSWORD"), /insecure default/);
});

test("production accepts a strong secret", () => {
  setEnv({ NODE_ENV: "production", ADMIN_JWT_SECRET: STRONG });
  assert.equal(requireSecret("ADMIN_JWT_SECRET"), STRONG);
});

test("development still runs with a weak secret", () => {
  setEnv({ NODE_ENV: "development", ADMIN_JWT_SECRET: "dev" });
  assert.equal(requireSecret("ADMIN_JWT_SECRET"), "dev");
});

test("a missing secret throws in any environment", () => {
  setEnv({ NODE_ENV: "development" });
  delete process.env.ADMIN_JWT_SECRET;
  assert.throws(() => requireSecret("ADMIN_JWT_SECRET"), /Missing required env var/);
});
