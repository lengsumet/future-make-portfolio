"use client";

import React, { useEffect, useState } from "react";
import { FaUsers, FaFileAlt, FaClock, FaBullseye } from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";
import { Skeleton, SkeletonStat, LoadingRegion } from "@/components/ui/Skeleton";
import { PageViewsChart, TopPagesChart } from "@/components/admin/AnalyticsChart";
import { DashboardStats, type StatCard } from "@/components/admin/DashboardStats";
import { PageHeader, Panel, Segmented } from "@/components/admin/AdminKit";
import { AnalyticsSummary } from "@/types/analytics";

type Range = "7d" | "30d" | "90d";

/**
 * The endpoint sends avgTimeOnSite (seconds) and conversionRate (percent) as
 * plain numbers although the type says string. Read either, so a number
 * shows with its unit and a preformatted string shows as sent.
 */
function measure(raw: string | number, suffix: string): Pick<StatCard, "value" | "suffix"> {
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(suffix, "").trim());
  if (!Number.isFinite(n) || (typeof raw === "string" && raw.trim() === "")) return { value: String(raw) };
  return { value: Number.isInteger(n) ? n : n.toFixed(1), suffix };
}

export default function AdminAnalyticsPage() {
  const reduce = useReducedMotion();
  const [data, setData] = useState<{ summary: AnalyticsSummary } | null>(null);
  const [range, setRange] = useState<Range>("7d");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset on a range change too: the figures on screen belong to the old
    // range, and leaving them up makes a slow request look like a fast one
    // that returned the same numbers.
    setLoading(true);
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  const summary = data?.summary;

  const overviewStats: StatCard[] = summary
    ? [
        { label: "Visitors", value: summary.totalVisitors, icon: FaUsers, sub: "Unique sessions" },
        { label: "Page views", value: summary.totalPageViews, icon: FaFileAlt, sub: "All tracked pages" },
        { label: "Avg time on site", ...measure(summary.avgTimeOnSite, "s"), icon: FaClock, sub: "Per session" },
        { label: "Conversion", ...measure(summary.conversionRate, "%"), icon: FaBullseye, sub: "Views → purchase" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="04 — Insight"
        title="Analytics"
        description="Usage data and visitor behaviour."
        actions={
          <Segmented<Range>
            label="Date range"
            value={range}
            onChange={setRange}
            options={(["7d", "30d", "90d"] as const).map((r) => ({
              value: r,
              label: <span className="font-mono text-xs">{r}</span>,
            }))}
          />
        }
      />

      {/* Overview stats */}
      {loading ? (
        <LoadingRegion label="Loading analytics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
          </div>
        </LoadingRegion>
      ) : (
        <DashboardStats stats={overviewStats} />
      )}

      {/* Charts */}
      {loading && (
        <LoadingRegion label="Loading charts">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6">
                <Skeleton className="mb-6 h-3 w-32" />
                <Skeleton className="h-52 w-full" />
              </div>
            ))}
          </div>
        </LoadingRegion>
      )}

      {!loading && summary && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PageViewsChart data={summary.dailyViews} title="Page views — last 7 days" />
          <TopPagesChart data={summary.topPages} title="Top pages" />
        </div>
      )}

      {/* Shop funnel */}
      {summary && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <Panel title="Shop conversion funnel">
            <ol className="space-y-5">
              {[
                {
                  label: "Product views",
                  value: summary.shopFunnel.productViews,
                  pct: 100,
                  color: "bg-[var(--accent-3)]",
                },
                {
                  label: "Checkout starts",
                  value: summary.shopFunnel.checkoutStarts,
                  pct:
                    summary.shopFunnel.productViews > 0
                      ? Math.round((summary.shopFunnel.checkoutStarts / summary.shopFunnel.productViews) * 100)
                      : 0,
                  color: "bg-[var(--accent)]",
                },
                {
                  label: "Purchases completed",
                  value: summary.shopFunnel.purchases,
                  pct:
                    summary.shopFunnel.productViews > 0
                      ? Math.round((summary.shopFunnel.purchases / summary.shopFunnel.productViews) * 100)
                      : 0,
                  color: "bg-[var(--accent-2)]",
                },
              ].map((step, i) => (
                <li key={step.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-4 sm:grid-cols-[11rem_1fr_7rem]">
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>
                    {step.label}
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.div
                      className={`${step.color} h-full rounded-full`}
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${step.pct}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 + i * 0.08 }}
                    />
                  </div>
                  <span className="text-right font-mono text-sm tabular-nums">
                    <span style={{ color: "var(--text-1)" }}>{step.value.toLocaleString()}</span>
                    <span className="ml-1.5 text-xs" style={{ color: "var(--text-3)" }}>{step.pct}%</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </motion.div>
      )}
    </div>
  );
}
