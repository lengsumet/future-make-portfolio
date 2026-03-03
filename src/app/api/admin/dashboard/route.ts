import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [orders, productViews, checkoutStarts, purchases, totalPageViews] = await Promise.all([
    db.order.findMany({ select: { status: true, totalAmount: true } }),
    db.pageEvent.count({ where: { eventType: "product_view" } }),
    db.pageEvent.count({ where: { eventType: "checkout_start" } }),
    db.pageEvent.count({ where: { eventType: "purchase_complete" } }),
    db.pageEvent.count({ where: { eventType: "page_view" } }),
  ]);

  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const uniqueSessions = await db.pageEvent.groupBy({
    by: ["sessionId"],
    where: { eventType: "page_view" },
  });

  return NextResponse.json({
    revenue: { total: totalRevenue, currency: "THB" },
    orders: {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      paid: orders.filter((o) => o.status === "paid").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    },
    visitors: {
      total: uniqueSessions.length,
      pageViews: totalPageViews,
    },
    shopFunnel: { productViews, checkoutStarts, purchases },
  });
}
