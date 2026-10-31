import { test, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { SignJWT, decodeJwt } from "jose";
import { NextRequest } from "next/server";
import { ADMIN_TOKEN_TTL_SECONDS, signAdminToken, verifyAdminToken } from "./admin";
import { requireAdmin } from "./requireAdmin";

const SECRET = "test-secret-".padEnd(48, "x");

beforeEach(() => {
  Object.assign(process.env, { NODE_ENV: "test", ADMIN_JWT_SECRET: SECRET, ADMIN_PASSWORD: "first-password" });
});

const key = () => new TextEncoder().encode(SECRET);
const withCookie = (token: string) =>
  new NextRequest("http://localhost/api/admin/dashboard", { headers: { cookie: `admin_token=${token}` } });

test("a fresh token verifies", async () => {
  assert.equal(await verifyAdminToken(await signAdminToken()), true);
});

test("a token lives one day", async () => {
  const { iat, exp } = decodeJwt(await signAdminToken());
  assert.equal(exp! - iat!, ADMIN_TOKEN_TTL_SECONDS);
  assert.equal(ADMIN_TOKEN_TTL_SECONDS, 86_400);
});

test("changing ADMIN_PASSWORD revokes every earlier token", async () => {
  const token = await signAdminToken();
  process.env.ADMIN_PASSWORD = "second-password";

  assert.equal(await verifyAdminToken(token), false);
  assert.equal((await requireAdmin(withCookie(token)))?.status, 401);
  assert.equal(await verifyAdminToken(await signAdminToken()), true, "a token issued after the change works");
});

test("a token signed with the secret but without pv is refused (tokens from before this change)", async () => {
  const legacy = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(key());
  assert.equal(await verifyAdminToken(legacy), false);
});

test("an expired token is refused", async () => {
  const { pv } = decodeJwt(await signAdminToken());
  const past = Math.floor(Date.now() / 1000) - 2 * ADMIN_TOKEN_TTL_SECONDS;
  const expired = await new SignJWT({ role: "admin", pv }).setProtectedHeader({ alg: "HS256" }).setIssuedAt(past).setExpirationTime(past + 60).sign(key());
  assert.equal(await verifyAdminToken(expired), false);
});

test("a token signed with another secret is refused", async () => {
  const { pv } = decodeJwt(await signAdminToken());
  const forged = await new SignJWT({ role: "admin", pv }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(new TextEncoder().encode("another-secret".padEnd(48, "y")));
  assert.equal(await verifyAdminToken(forged), false);
});

test("pv does not expose the password", async () => {
  const { pv } = decodeJwt(await signAdminToken());
  assert.equal(typeof pv, "string");
  assert.ok(!String(pv).includes("first-password"));
});

test("requireAdmin lets a valid cookie through and refuses a missing one", async () => {
  assert.equal(await requireAdmin(withCookie(await signAdminToken())), null);
  assert.equal((await requireAdmin(new NextRequest("http://localhost/api/admin/dashboard")))?.status, 401);
});

test("the /admin proxy sends a revoked session back to login and clears the cookie", async () => {
  const { proxy } = await import("@/proxy");
  const token = await signAdminToken();
  const page = (t: string) => new NextRequest("http://localhost/admin/orders", { headers: { cookie: `admin_token=${t}` } });

  assert.equal((await proxy(page(token))).headers.get("location"), null, "valid session was redirected");

  process.env.ADMIN_PASSWORD = "second-password";
  const res = await proxy(page(token));
  assert.equal(new URL(res.headers.get("location")!).pathname, "/admin/login");
  assert.match(res.headers.get("set-cookie") ?? "", /admin_token=;/);
});

test("a weak secret in production denies every token and says why", async () => {
  const token = await signAdminToken();
  Object.assign(process.env, { NODE_ENV: "production", ADMIN_JWT_SECRET: "short" });
  const logged = mock.method(console, "error", () => {});

  assert.equal(await verifyAdminToken(token), false);
  assert.equal((await requireAdmin(withCookie(token)))?.status, 401);
  const { proxy } = await import("@/proxy");
  assert.equal(new URL((await proxy(new NextRequest("http://localhost/admin", { headers: { cookie: `admin_token=${token}` } }))).headers.get("location")!).pathname, "/admin/login");
  logged.mock.restore();

  assert.ok(logged.mock.callCount() >= 1, "a weak secret was rejected silently");
  assert.match(String(logged.mock.calls[0].arguments[1]), /at least 32 characters/);
});
