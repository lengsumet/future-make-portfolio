"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Order } from "@/types/shop";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-300",
  paid: "bg-blue-500/20 text-blue-300",
  delivered: "bg-green-500/20 text-green-300",
  cancelled: "bg-red-500/20 text-red-300",
};

const STATUS_FLOW: Record<string, string> = {
  pending: "paid",
  paid: "delivered",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shop/orders")
      .then((r) => r.json())
      .then(setOrders);
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/shop/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "paid", "delivered"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              filter === s
                ? "bg-emerald-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {s} <span className="ml-1 text-xs opacity-70">({counts[s as keyof typeof counts] ?? 0})</span>
          </button>
        ))}
      </div>

      <motion.div
        className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700/50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {filtered.map((order) => (
                <tr key={order.id} className="text-gray-300 hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{order.buyerName}</div>
                    <div className="text-xs text-gray-500">{order.buyerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs max-w-[140px] truncate">
                    {order.items[0]?.title}
                    {order.items.length > 1 && ` +${order.items.length - 1}`}
                  </td>
                  <td className="px-4 py-3 font-medium">฿{order.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {STATUS_FLOW[order.status] && (
                      <button
                        disabled={updating === order.id}
                        onClick={() => updateStatus(order.id, STATUS_FLOW[order.status])}
                        className="text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 px-2 py-1 rounded transition-colors disabled:opacity-50 capitalize"
                      >
                        Mark {STATUS_FLOW[order.status]}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">No orders found.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
