import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { POST } from "./route";

// Stubbed delegates: the only database available is the shared Neon one, and
// a test must never write orders into it.
const PRODUCT = { id: "p-wms", slug: "enterprise-wms", title: "Enterprise WMS", price: 39900 };
let created: { data: Record<string, unknown> } | null;
const events: Record<string, unknown>[] = [];

beforeEach(() => {
  created = null;
  events.length = 0;
  Object.assign(db.product, {
    findFirst: async ({ where }: { where: { id: string; status: string } }) =>
      where.id === PRODUCT.id && where.status === "active" ? PRODUCT : null,
  });
  Object.assign(db.order, {
    create: async (args: { data: Record<string, unknown> }) => {
      created = args;
      return { id: "o1", orderNumber: "ORD-TEST", items: [] };
    },
  });
  Object.assign(db.pageEvent, {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      events.push(data);
      return { id: 1 };
    },
  });
});

function checkout(body: Record<string, unknown>) {
  return POST(
    new NextRequest("http://localhost/api/shop/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const buyer = { buyerName: "Somchai", buyerEmail: "somchai@example.com" };

test("a forged price is ignored: the order carries the database price and title", async () => {
  const res = await checkout({ ...buyer, productId: PRODUCT.id, price: 1, productTitle: "Free stuff" });

  assert.equal(res.status, 201);
  assert.ok(created, "order was not created");
  assert.equal(created.data.totalAmount, 39900);
  const item = (created.data.items as { create: Record<string, unknown>[] }).create[0];
  assert.equal(item.price, 39900);
  assert.equal(item.title, "Enterprise WMS");
});

test("an unknown or inactive product answers 404 and creates nothing", async () => {
  const res = await checkout({ ...buyer, productId: "does-not-exist" });

  assert.equal(res.status, 404);
  assert.equal(created, null);
});

test("purchase_complete is recorded by the server under the visitor's session, with the database price", async () => {
  await checkout({ ...buyer, productId: PRODUCT.id, price: 1, sessionId: "s-1730000000000-abc1234" });

  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, "purchase_complete");
  assert.equal(events[0].sessionId, "s-1730000000000-abc1234");
  assert.equal(events[0].element, PRODUCT.id);
  assert.deepEqual(JSON.parse(events[0].metadata as string), { price: 39900, orderId: "o1" });
});

test("without a session the purchase is still recorded, keyed on the order", async () => {
  await checkout({ ...buyer, productId: PRODUCT.id });

  assert.equal(events.length, 1);
  assert.equal(events[0].sessionId, "order:o1");
});

test("an invalid session id is dropped: the order is still created and the purchase keyed on it", async () => {
  for (const sessionId of ["s".repeat(100), "", 42, { evil: true }]) {
    created = null;
    events.length = 0;
    const res = await checkout({ ...buyer, productId: PRODUCT.id, sessionId });

    assert.equal(res.status, 201, `sessionId ${JSON.stringify(sessionId)} lost the order`);
    assert.ok(created, "order was not created");
    assert.equal(events[0].sessionId, "order:o1");
  }
});
