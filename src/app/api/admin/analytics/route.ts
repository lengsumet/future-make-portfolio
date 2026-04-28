import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
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
    productViews > 0 ? parseFloat(((purchases / productViews) * 100).toFixed(2)) : 0;

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
  } catch (error) {
    console.error("[admin/analytics] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
