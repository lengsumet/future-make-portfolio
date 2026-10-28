import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { POST } from "./route";

// Stubbed: the only database available is the shared Neon one.
const saved: Record<string, unknown>[] = [];

beforeEach(() => {
  saved.length = 0;
  Object.assign(db.pageEvent, {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      saved.push(data);
      return { id: saved.length };
    },
  });
});

// sendBeacon posts a string body as text/plain, so that is what the tests send.
function track(body: unknown) {
  return POST(
    new NextRequest("http://localhost/api/track", {
      method: "POST",
      headers: { "content-type": "text/plain;charset=UTF-8" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const valid = { sessionId: "s-1730000000000-abc1234", eventType: "page_view", page: "/shop" };

test("a valid beacon is stored", async () => {
  const res = await track({ ...valid, element: "hero", metadata: { depth: 50 } });

  assert.equal(res.status, 200);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].eventType, "page_view");
  assert.equal(saved[0].metadata, '{"depth":50}');
});

test("an event type outside the list is rejected", async () => {
  const res = await track({ ...valid, eventType: "drop_table" });

  assert.equal(res.status, 400);
  assert.equal(saved.length, 0);
});

test("purchase_complete from a browser is rejected", async () => {
  const res = await track({ ...valid, eventType: "purchase_complete" });

  assert.equal(res.status, 400);
  assert.equal(saved.length, 0);
});

test("oversized fields are rejected", async () => {
  for (const body of [
    { ...valid, page: `/${"a".repeat(400)}` },
    { ...valid, sessionId: "s".repeat(100) },
    { ...valid, element: "e".repeat(200) },
    { ...valid, metadata: { blob: "x".repeat(2000) } },
  ]) {
    const res = await track(body);
    assert.equal(res.status, 400, `accepted ${Object.keys(body).join(",")}`);
  }
  assert.equal(saved.length, 0);
});

test("a body over the size cap is rejected before parsing", async () => {
  const res = await track(`{"pad":"${"x".repeat(10_000)}"}`);

  assert.equal(res.status, 413);
  assert.equal(saved.length, 0);
});

test("malformed JSON answers 400", async () => {
  const res = await track("{not json");

  assert.equal(res.status, 400);
  assert.equal(saved.length, 0);
});
