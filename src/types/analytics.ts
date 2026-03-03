export type AnalyticsEventType =
  | "page_view"
  | "page_exit"
  | "skill_hover"
  | "timeline_view"
  | "contact_click"
  | "resume_download"
  | "product_view"
  | "demo_click"
  | "checkout_start"
  | "purchase_complete"
  | "scroll_depth"
  | "cta_click";

export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  page: string;
  element?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  createdAt: string;
}

export interface PageStat {
  page: string;
  views: number;
  percentage: number;
}

export interface DailyView {
  date: string;
  views: number;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalPageViews: number;
  avgTimeOnSite: string;
  conversionRate: string;
  topPages: PageStat[];
  dailyViews: DailyView[];
  shopFunnel: {
    productViews: number;
    checkoutStarts: number;
    purchases: number;
  };
}
