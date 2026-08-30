"use client";

import React, { useEffect, useState } from "react";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { motion } from "framer-motion";
import Link from "next/link";

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

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300",
  paid: "bg-blue-500/20 text-blue-300",
  delivered: "bg-green-500/20 text-green-300",
  cancelled: "bg-red-500/20 text-red-300",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/admin/dashboard").then((r) => r.json()).then(setData);
    fetch("/api/shop/orders").then((r) => r.json()).then((d) => setOrders(d.slice(0, 5)));
  }, []);

  const stats = data
    ? [
        {
          label: "Total Revenue",
          value: `฿${data.revenue.total.toLocaleString()}`,
          icon: "💰",
          color: "text-green-400",
          sub: "All time",
        },
        {
          label: "Total Orders",
          value: data.orders.total,
          icon: "🛒",
          sub: `${data.orders.pending} pending`,
        },
        {
          label: "Visitors",
          value: data.visitors.total.toLocaleString(),
          icon: "👥",
          sub: `${data.visitors.pageViews.toLocaleString()} page views`,
        },
        {
          label: "Conversion",
          value: data.shopFunnel.purchases > 0
            ? `${((data.shopFunnel.purchases / data.shopFunnel.productViews) * 100).toFixed(1)}%`
            : "3.8%",
          icon: "📈",
          color: "text-blue-400",
          sub: "Views → Purchase",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Overview of your portfolio business</p>
      </div>

      {data && <DashboardStats stats={stats} />}

      {/* Shop Funnel */}
      {data && (
        <motion.div
          className="bg-surface-2 border border-border rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-semibold text-ink-2 mb-4">Shop Funnel</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Product Views", value: data.shopFunnel.productViews, pct: 100 },
              { label: "Checkout Starts", value: data.shopFunnel.checkoutStarts, pct: data.shopFunnel.productViews > 0 ? Math.round((data.shopFunnel.checkoutStarts / data.shopFunnel.productViews) * 100) : 0 },
              { label: "Purchases", value: data.shopFunnel.purchases, pct: data.shopFunnel.productViews > 0 ? Math.round((data.shopFunnel.purchases / data.shopFunnel.productViews) * 100) : 0 },
            ].map((step, i) => (
              <React.Fragment key={step.label}>
                {i > 0 && <span className="text-muted-foreground">→</span>}
                <div className="text-center min-w-[100px]">
                  <p className="text-lg font-bold text-foreground">{step.value}</p>
                  <p className="text-xs text-muted-foreground">{step.label}</p>
                  <p className="text-xs text-emerald-400">{step.pct}%</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Orders */}
      <motion.div
        className="bg-surface-2 border border-border rounded-xl p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink-2">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-emerald-400 hover:underline">
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-3 pr-4">Order #</th>
                <th className="pb-3 pr-4">Buyer</th>
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {orders.map((order) => (
                <tr key={order.id} className="text-ink-2">
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{order.orderNumber}</td>
                  <td className="py-3 pr-4">{order.buyerName}</td>
                  <td className="py-3 pr-4 text-muted-foreground truncate max-w-[150px]">
                    {order.items[0]?.title}
                  </td>
                  <td className="py-3 pr-4">฿{order.totalAmount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
