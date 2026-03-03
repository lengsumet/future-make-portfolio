import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalPageViews, recentEvents, productViews, checkoutStarts, purchases, uniqueSessions, topPageCounts, recentForDaily] =
    await Promise.all([
      db.pageEvent.count({ where: { eventType: "page_view" } }),
      db.pageEvent.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      db.pageEvent.count({ where: { eventType: "product_view" } }),
      db.pageEvent.count({ where: { eventType: "checkout_start" } }),
      db.pageEvent.count({ where: { eventType: "purchase_complete" } }),
      db.pageEvent.groupBy({ by: ["sessionId"], where: { eventType: "page_view" } }),
      db.pageEvent.groupBy({
        by: ["page"],
        where: { eventType: "page_view" },
        _count: { page: true },
        orderBy: { _count: { page: "desc" } },
        take: 10,
      }),
      db.pageEvent.findMany({
        where: { eventType: "page_view", createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

  const totalVisitors = uniqueSessions.length;
  const topPages = topPageCounts.map((p) => ({ page: p.page, views: p._count.page }));

  // Group daily views in JS
  const dailyMap = new Map<string, number>();
  recentForDaily.forEach((e) => {
    const day = e.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  });
  const dailyViews = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const conversionRate =
    totalVisitors > 0 ? parseFloat(((purchases / totalVisitors) * 100).toFixed(2)) : 0;

  return NextResponse.json({
    summary: {
      totalVisitors,
      totalPageViews,
      avgTimeOnSite: 145, // seconds – placeholder until session-duration tracking is added
      conversionRate,
      topPages,
      dailyViews,
      shopFunnel: { productViews, checkoutStarts, purchases },
    },
    recentEvents,
  });
}
