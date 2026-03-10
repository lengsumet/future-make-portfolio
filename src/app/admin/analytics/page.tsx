"use client";

import React, { useEffect, useState } from "react";
import { PageViewsChart, TopPagesChart } from "@/components/admin/AnalyticsChart";
import { AnalyticsSummary } from "@/types/analytics";
import { motion } from "framer-motion";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<{ summary: AnalyticsSummary } | null>(null);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData);
  }, [range]);

  const summary = data?.summary;

  const overviewStats = summary
    ? [
        { label: "Total Visitors", value: summary.totalVisitors.toLocaleString(), icon: "👥" },
        { label: "Page Views", value: summary.totalPageViews.toLocaleString(), icon: "📄" },
        { label: "Avg Time on Site", value: summary.avgTimeOnSite, icon: "⏱️" },
        { label: "Conversion Rate", value: summary.conversionRate, icon: "🎯" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Usage data and visitor behavior</p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                range === r ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-xl font-bold text-white mt-2">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PageViewsChart data={summary.dailyViews} title="Page Views (Last 7 Days)" />
          <TopPagesChart data={summary.topPages} title="Top Pages" />
        </div>
      )}

      {/* Shop Funnel */}
      {summary && (
        <motion.div
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-gray-300 mb-5">Shop Conversion Funnel</h2>
          <div className="space-y-3">
            {[
              {
                label: "Product Views",
                value: summary.shopFunnel.productViews,
                pct: 100,
                color: "bg-emerald-500",
              },
              {
                label: "Checkout Starts",
                value: summary.shopFunnel.checkoutStarts,
                pct:
                  summary.shopFunnel.productViews > 0
                    ? Math.round((summary.shopFunnel.checkoutStarts / summary.shopFunnel.productViews) * 100)
                    : 0,
                color: "bg-blue-500",
              },
              {
                label: "Purchases Completed",
                value: summary.shopFunnel.purchases,
                pct:
                  summary.shopFunnel.productViews > 0
                    ? Math.round((summary.shopFunnel.purchases / summary.shopFunnel.productViews) * 100)
                    : 0,
                color: "bg-green-500",
              },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-36 text-sm text-gray-400 flex-shrink-0">{step.label}</div>
                <div className="flex-1 bg-gray-700/50 rounded-full h-2.5">
                  <motion.div
                    className={`${step.color} h-2.5 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${step.pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="w-20 text-right text-sm">
                  <span className="text-white font-medium">{step.value}</span>
                  <span className="text-gray-500 ml-1">({step.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
