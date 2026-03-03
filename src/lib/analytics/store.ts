import { AnalyticsEvent, AnalyticsEventType } from "@/types/analytics";

// In-memory analytics store for demo.
// In production, replace with database (Prisma + PostgreSQL).
const events: AnalyticsEvent[] = [];

let sessionCount = 124; // seed with realistic data

export function trackEvent(data: {
  sessionId: string;
  eventType: AnalyticsEventType;
  page: string;
  element?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
}): AnalyticsEvent {
  const event: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sessionId: data.sessionId,
    eventType: data.eventType,
    page: data.page,
    element: data.element,
    metadata: data.metadata,
    userAgent: data.userAgent,
    createdAt: new Date().toISOString(),
  };
  events.push(event);
  if (data.eventType === "page_view") sessionCount++;
  return event;
}

export function getAnalyticsSummary() {
  const pageViews = events.filter((e) => e.eventType === "page_view").length + 847;
  const productViews = events.filter((e) => e.eventType === "product_view").length + 312;
  const checkoutStarts = events.filter((e) => e.eventType === "checkout_start").length + 48;
  const purchases = events.filter((e) => e.eventType === "purchase_complete").length + 12;

  // Page breakdown (seeded)
  const pageCounts: Record<string, number> = { "/": 420, "/about": 210, "/showcase": 165, "/shop": 52 };
  events
    .filter((e) => e.eventType === "page_view")
    .forEach((e) => {
      pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
    });
  const totalViews = Object.values(pageCounts).reduce((a, b) => a + b, 0);
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([page, views]) => ({ page, views, percentage: Math.round((views / totalViews) * 100) }));

  // Daily views (last 7 days, seeded)
  const dailyViews = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toLocaleDateString("en-US", { weekday: "short" }),
      views: Math.floor(80 + Math.random() * 80),
    };
  });

  return {
    totalVisitors: sessionCount,
    totalPageViews: pageViews,
    avgTimeOnSite: "2m 34s",
    conversionRate: purchases > 0 ? ((purchases / productViews) * 100).toFixed(1) + "%" : "3.8%",
    topPages,
    dailyViews,
    shopFunnel: { productViews, checkoutStarts, purchases },
  };
}

export function getRecentEvents(limit = 20): AnalyticsEvent[] {
  return [...events].reverse().slice(0, limit);
}
