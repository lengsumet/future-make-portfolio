import { test, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { POST } from "./route";

// The attempt table is an in-memory stand-in: the only database is the shared
// Neon one, and a test must not write into it.
type Row = { ipHash: string; createdAt: Date };
let rows: Row[];

type Where = { ipHash?: string; createdAt?: { gte?: Date; lt?: Date } };
const matches = (r: Row, w: Where) =>
  (w.ipHash === undefined || r.ipHash === w.ipHash) &&
  (w.createdAt?.gte === undefined || r.createdAt >= w.createdAt.gte) &&
  (w.createdAt?.lt === undefined || r.createdAt < w.createdAt.lt);

beforeEach(() => {
  rows = [];
  Object.assign(process.env, { NODE_ENV: "test", ADMIN_JWT_SECRET: "test-secret-".padEnd(48, "x"), ADMIN_PASSWORD: "right-password" });
  Object.assign(db.loginAttempt, {
    create: async ({ data }: { data: { ipHash: string } }) => {
      rows.push({ ipHash: data.ipHash, createdAt: new Date() });
      return {};
    },
    count: async ({ where }: { where: Where }) => rows.filter((r) => matches(r, where)).length,
    deleteMany: async ({ where }: { where: Where }) => {
      const before = rows.length;
      rows = rows.filter((r) => !matches(r, where));
      return { count: before - rows.length };
    },
  });
});

function login(password: string, ip = "203.0.113.7") {
  return POST(
    new NextRequest("http://localhost/api/auth/admin", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ password }),
    }),
  );
}

test("the right password sets the admin cookie", async () => {
  const res = await login("right-password");

  assert.equal(res.status, 200);
  const cookie = res.cookies.get("admin_token");
  assert.ok(cookie, "no admin_token cookie");
  assert.equal(cookie.httpOnly, true);
});

test("the sixth attempt inside the window is refused, even with the right password", async () => {
  for (let i = 0; i < 5; i++) assert.equal((await login("wrong")).status, 401);

  assert.equal((await login("right-password")).status, 429);
});

test("parallel guesses cannot slip past the limit", async () => {
  const statuses = (await Promise.all(Array.from({ length: 20 }, () => login("wrong")))).map((r) => r.status);

  assert.ok(statuses.filter((s) => s !== 429).length <= 5, `got ${statuses.join(",")}`);
});

test("the limit is per address", async () => {
  for (let i = 0; i < 6; i++) await login("wrong", "198.51.100.1");

  assert.equal((await login("right-password", "198.51.100.2")).status, 200);
});

test("attempts older than the window no longer count, and are pruned", async () => {
  for (let i = 0; i < 6; i++) await login("wrong");
  const old = new Date(Date.now() - 16 * 60 * 1000);
  rows = rows.map((r) => ({ ...r, createdAt: old }));

  assert.equal((await login("right-password")).status, 200);
  assert.equal(rows.filter((r) => r.createdAt <= old).length, 0, "stale rows were left behind");
});

test("a successful login clears that address's attempts", async () => {
  for (let i = 0; i < 4; i++) await login("wrong");
  assert.equal((await login("right-password")).status, 200);

  for (let i = 0; i < 5; i++) assert.equal((await login("wrong")).status, 401, `attempt ${i + 1} after login`);
});

test("the address is stored hashed, never raw", async () => {
  await login("wrong", "203.0.113.99");

  assert.equal(rows.length, 1);
  assert.ok(!rows[0].ipHash.includes("203.0.113.99"));
});

test("a malformed body still counts as an attempt", async () => {
  const garbage = () =>
    POST(new NextRequest("http://localhost/api/auth/admin", { method: "POST", headers: { "x-forwarded-for": "203.0.113.7" }, body: "{not json" }));
  for (let i = 0; i < 5; i++) assert.equal((await garbage()).status, 400);

  assert.equal((await login("right-password")).status, 429);
});

test("a database failure answers 500 and never logs anyone in", async () => {
  Object.assign(db.loginAttempt, {
    create: async () => {
      throw new Error("connection refused");
    },
  });
  const quiet = mock.method(console, "error", () => {});

  const res = await login("right-password");
  quiet.mock.restore();

  assert.equal(res.status, 500);
  assert.equal(res.cookies.get("admin_token"), undefined);
});

test("a database failure after the right password answers 500, not 400", async () => {
  Object.assign(db.loginAttempt, {
    deleteMany: async ({ where }: { where: Where }) => {
      if (where.ipHash) throw new Error("connection reset");
      return { count: 0 };
    },
  });
  const quiet = mock.method(console, "error", () => {});

  const res = await login("right-password");
  quiet.mock.restore();

  assert.equal(res.status, 500);
  assert.equal(res.cookies.get("admin_token"), undefined);
});
