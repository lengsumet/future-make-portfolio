"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FaWallet, FaReceipt, FaUsers, FaChartLine, FaArrowRight } from "react-icons/fa";
import { Skeleton, SkeletonStat, SkeletonTable, LoadingRegion } from "@/components/ui/Skeleton";
import { DashboardStats, type StatCard } from "@/components/admin/DashboardStats";
import { PageHeader, Panel, StatusPill, Th } from "@/components/admin/AdminKit";

interface DashboardData {
  revenue: { total: number; currency: string };
  orders: { total: number; pending: number; paid: number; delivered: number };
  visitors: { total: number; pageViews: number };
  shopFunnel: { productViews: number; checkoutStarts: number; purchases: number };
}

interface Order {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  totalAmount: number;
  items: Array<{ title: string }>;
  createdAt: string;
}

export default function AdminDashboard() {
  const reduce = useReducedMotion();
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  // Tracked separately: the two requests land independently, and one panel
  // should not sit blank waiting on the other's response.
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoadingStats(false));
    fetch("/api/shop/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, []);

  const stats: StatCard[] = data
    ? [
        {
          label: "Revenue",
          prefix: "฿",
          value: data.revenue.total,
          icon: FaWallet,
          sub: "All time",
        },
        {
          label: "Orders",
          value: data.orders.total,
          icon: FaReceipt,
          sub: `${data.orders.pending} pending`,
        },
        {
          label: "Visitors",
          value: data.visitors.total,
          icon: FaUsers,
          sub: `${data.visitors.pageViews.toLocaleString()} page views`,
        },
        {
          label: "Conversion",
          // The real ratio, or a dash when there is nothing to divide by. It
          // used to show a made-up 3.8% whenever there were no purchases.
          value: data.shopFunnel.productViews > 0
            ? `${((data.shopFunnel.purchases / data.shopFunnel.productViews) * 100).toFixed(1)}%`
            : "—",
          icon: FaChartLine,
          sub: "Views → purchase",
        },
      ]
    : [];

  const enter = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  const funnel = data
    ? [
        { label: "Product views", value: data.shopFunnel.productViews, pct: 100 },
        { label: "Checkout starts", value: data.shopFunnel.checkoutStarts, pct: data.shopFunnel.productViews > 0 ? Math.round((data.shopFunnel.checkoutStarts / data.shopFunnel.productViews) * 100) : 0 },
        { label: "Purchases", value: data.shopFunnel.purchases, pct: data.shopFunnel.productViews > 0 ? Math.round((data.shopFunnel.purchases / data.shopFunnel.productViews) * 100) : 0 },
      ]
    : [];

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="01 — Overview" title="Dashboard" description="How the portfolio business is doing, at a glance." />

      {loadingStats ? (
        <LoadingRegion label="Loading dashboard figures">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
          </div>
        </LoadingRegion>
      ) : (
        data && <DashboardStats stats={stats} />
      )}

      {/* Shop funnel */}
      {loadingStats && (
        <LoadingRegion label="Loading shop funnel">
          <Panel title="Shop funnel">
            <div className="grid gap-6 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          </Panel>
        </LoadingRegion>
      )}
      {!loadingStats && data && (
        <motion.div {...enter(0.15)}>
          <Panel title="Shop funnel">
            <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
              {funnel.map((step, i) => (
                <li key={step.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>
                      <span className="mr-2 font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                        0{i + 1}
                      </span>
                      {step.label}
                    </p>
                    <p className="font-mono text-xs" style={{ color: "var(--accent-3)" }}>
                      {step.pct}%
                    </p>
                  </div>
                  <p className="display text-silver mt-3 pb-[0.06em] text-3xl tabular-nums">
                    {step.value.toLocaleString()}
                  </p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent-2)] to-[var(--accent-3)]"
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${step.pct}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.08 }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </motion.div>
      )}

      {/* Recent orders */}
      <motion.div {...enter(0.25)}>
        <Panel
          title="Recent orders"
          bodyClassName=""
          aside={
            <Link
              href="/admin/orders"
              className="group inline-flex items-center gap-1.5 text-xs text-[var(--accent-3)] transition-colors hover:text-[var(--text-1)]"
            >
              View all
              <FaArrowRight size={9} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          }
        >
          {loadingOrders ? (
            <LoadingRegion label="Loading recent orders">
              <SkeletonTable rows={5} cols={5} />
            </LoadingRegion>
          ) : orders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm" style={{ color: "var(--text-2)" }}>No orders yet.</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>New orders from the shop will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Buyer</Th>
                    <Th>Product</Th>
                    <Th align="right">Amount</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-[var(--border)] transition-colors hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs" style={{ color: "var(--text-3)" }}>{order.orderNumber}</td>
                      <td className="px-6 py-3.5" style={{ color: "var(--text-1)" }}>{order.buyerName}</td>
                      <td className="max-w-[200px] truncate px-6 py-3.5" style={{ color: "var(--text-3)" }}>
                        {order.items[0]?.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-right font-mono tabular-nums" style={{ color: "var(--text-1)" }}>
                        ฿{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusPill status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </motion.div>
    </div>
  );
}
