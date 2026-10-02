"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SkeletonTable, LoadingRegion } from "@/components/ui/Skeleton";
import { PageHeader, Panel, Segmented, StatusPill, Th } from "@/components/admin/AdminKit";
import { Order } from "@/types/shop";

const STATUS_FLOW: Record<string, string> = {
  pending: "paid",
  paid: "delivered",
};

type Filter = "all" | "pending" | "paid" | "delivered";

export default function AdminOrdersPage() {
  const reduce = useReducedMotion();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop/orders")
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
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

  const counts: Record<Filter, number> = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="03 — Sales"
        title="Orders"
        description={
          <>
            <span className="font-mono" style={{ color: "var(--text-2)" }}>{orders.length}</span> orders in total
          </>
        }
        actions={
          <Segmented<Filter>
            label="Filter orders by status"
            value={filter}
            onChange={setFilter}
            options={(["all", "pending", "paid", "delivered"] as const).map((s) => ({
              value: s,
              label: (
                <>
                  {s}
                  <span className="ml-1.5 font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                    {counts[s]}
                  </span>
                </>
              ),
            }))}
          />
        }
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Panel bodyClassName="" className="overflow-hidden">
          {loading ? (
            <LoadingRegion label="Loading orders">
              <SkeletonTable rows={6} cols={7} />
            </LoadingRegion>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                {orders.length === 0 ? "No orders yet." : "No orders with this status."}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
                {orders.length === 0 ? "Orders placed in the shop will land here." : "Try another filter above."}
              </p>
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
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th align="right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-t border-[var(--border)] transition-colors hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs" style={{ color: "var(--text-3)" }}>{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div style={{ color: "var(--text-1)" }}>{order.buyerName}</div>
                        <div className="text-xs" style={{ color: "var(--text-3)" }}>{order.buyerEmail}</div>
                      </td>
                      <td className="max-w-[240px] truncate px-6 py-4 text-xs" style={{ color: "var(--text-2)" }}>
                        {order.items[0]?.title}
                        {order.items.length > 1 && (
                          <span className="ml-1 font-mono" style={{ color: "var(--text-4)" }}>+{order.items.length - 1}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-mono tabular-nums" style={{ color: "var(--text-1)" }}>
                        ฿{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs" style={{ color: "var(--text-3)" }}>
                        {new Date(order.createdAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {STATUS_FLOW[order.status] && (
                          <button
                            type="button"
                            disabled={updating === order.id}
                            onClick={() => updateStatus(order.id, STATUS_FLOW[order.status])}
                            className="whitespace-nowrap rounded-full! border border-[var(--border-mid)] px-3 py-1 text-xs capitalize text-[var(--text-1)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-bg)] disabled:opacity-50"
                          >
                            {updating === order.id ? "Saving…" : `Mark ${STATUS_FLOW[order.status]}`}
                          </button>
                        )}
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
