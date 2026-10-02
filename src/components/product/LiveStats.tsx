"use client";

import { systemUrl } from "@/lib/system-urls";
import React, { useState, useEffect } from "react";

interface WmsStats { totalProducts: number; totalInventoryItems: number; totalInboundOrders: number; totalOutboundOrders: number; totalWarehouses: number; totalZones: number; totalBins: number; totalUsers: number; totalPickLists: number; systemStatus: string; }
interface PosStats { totalProducts: number; totalCategories: number; totalTransactions: number; totalCustomers: number; todaySales: number; todayTransactions: number; }
interface CrmStats { totalContacts: number; totalCompanies: number; totalDeals: number; activeDeals: number; pipelineValue: number; wonThisMonth: number; }
interface TmsStats { totalVehicles: number; totalDrivers: number; totalRoutes: number; activeShipments: number; totalDeliveries: number; onTimeRate: number; }
interface ImsStats { products: number; movements: number; warehouses: number; status: string; }
interface ScmsStats { suppliers: number; purchaseOrders: number; orders: number; risks: number; status: string; }
interface PmsStats { workOrders: number; activeWorkOrders: number; productionLines: number; machines: number; ncrs: number; status: string; }
interface ShopStats { products: number; activeProducts: number; lowStockProducts: number; orders: number; paidOrders: number; customers: number; revenue: number; revenueThisMonth: number; ordersThisMonth: number; }
interface DashStats { metricSnapshots: number; totalAlerts: number; activeAlerts: number; reports: number; status: string; }

const wmsStatItems = [
  { key: "totalProducts", label: "Products" },
  { key: "totalInventoryItems", label: "Inventory Items" },
  { key: "totalInboundOrders", label: "Inbound Orders" },
  { key: "totalOutboundOrders", label: "Outbound Orders" },
  { key: "totalWarehouses", label: "Warehouses" },
  { key: "totalZones", label: "Zones" },
  { key: "totalBins", label: "Storage Bins" },
  { key: "totalUsers", label: "Users" },
  { key: "totalPickLists", label: "Pick Lists" },
];
const posStatItems = [
  { key: "totalProducts", label: "Products" },
  { key: "totalCategories", label: "Categories" },
  { key: "totalTransactions", label: "Transactions" },
  { key: "totalCustomers", label: "Customers" },
  { key: "todaySales", label: "Today Sales (฿)" },
  { key: "todayTransactions", label: "Today Orders" },
];
const crmStatItems = [
  { key: "totalContacts", label: "Contacts" },
  { key: "totalCompanies", label: "Companies" },
  { key: "totalDeals", label: "Total Deals" },
  { key: "activeDeals", label: "Active Deals" },
  { key: "pipelineValue", label: "Pipeline Value (฿)" },
  { key: "wonThisMonth", label: "Won This Month" },
];
const tmsStatItems = [
  { key: "totalVehicles", label: "Vehicles" },
  { key: "totalDrivers", label: "Drivers" },
  { key: "totalRoutes", label: "Routes" },
  { key: "activeShipments", label: "Active Shipments" },
  { key: "totalDeliveries", label: "Deliveries" },
  { key: "onTimeRate", label: "On-Time Rate (%)" },
];
const imsStatItems = [
  { key: "products", label: "Products" },
  { key: "movements", label: "Stock Movements" },
  { key: "warehouses", label: "Warehouses" },
];
const scmsStatItems = [
  { key: "suppliers", label: "Suppliers" },
  { key: "purchaseOrders", label: "Purchase Orders" },
  { key: "orders", label: "Sales Orders" },
  { key: "risks", label: "Active Risks" },
];
const pmsStatItems = [
  { key: "workOrders", label: "Work Orders" },
  { key: "activeWorkOrders", label: "Active WOs" },
  { key: "productionLines", label: "Prod. Lines" },
  { key: "machines", label: "Machines" },
  { key: "ncrs", label: "Open NCRs" },
];
const dashStatItems = [
  { key: "metricSnapshots", label: "Metrics (30d)" },
  { key: "totalAlerts", label: "Total Alerts" },
  { key: "activeAlerts", label: "Active Alerts" },
  { key: "reports", label: "Reports" },
];

const shopStatItems = [
  { key: "products", label: "Products" },
  { key: "activeProducts", label: "On Sale" },
  { key: "lowStockProducts", label: "Low Stock" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "revenue", label: "Revenue (฿)" },
];

const SYSTEM_CONFIG = {
  wms:       { url: systemUrl(process.env.NEXT_PUBLIC_WMS_URL, "wms", "3001"), label: "WMS",       port: "3001", items: wmsStatItems },
  pos:       { url: systemUrl(process.env.NEXT_PUBLIC_POS_URL, "pos", "3002"), label: "POS",       port: "3002", items: posStatItems },
  crm:       { url: systemUrl(process.env.NEXT_PUBLIC_CRM_URL, "crm", "3003"), label: "CRM",       port: "3003", items: crmStatItems },
  tms:       { url: systemUrl(process.env.NEXT_PUBLIC_TMS_URL, "tms", "3004"), label: "TMS",       port: "3004", items: tmsStatItems },
  ims:       { url: systemUrl(process.env.NEXT_PUBLIC_IMS_URL, "ims", "3005"), label: "IMS",       port: "3005", items: imsStatItems },
  scms:      { url: systemUrl(process.env.NEXT_PUBLIC_SCMS_URL, "scms", "3006"), label: "SCMS",      port: "3006", items: scmsStatItems },
  pms:       { url: systemUrl(process.env.NEXT_PUBLIC_PMS_URL, "pms", "3007"), label: "PMS",       port: "3007", items: pmsStatItems },
  dashboard: { url: systemUrl(process.env.NEXT_PUBLIC_DASHBOARD_URL, "dashboard", "3008"), label: "Dashboard", port: "3008", items: dashStatItems },
  ecommerce: { url: systemUrl(process.env.NEXT_PUBLIC_ECOMMERCE_URL, "ecommerce", "3009"), label: "Storefront", port: "3009", items: shopStatItems },
};

/**
 * Derived from the config rather than written out again.
 *
 * The two lists had already drifted: the storefront was added to neither, so
 * the one system a customer actually sees was the only one with no live read.
 * Deriving it means adding a system to `SYSTEM_CONFIG` is all it takes.
 */
export type LiveSystem = keyof typeof SYSTEM_CONFIG;

interface LiveStatsProps {
  system?: LiveSystem;
}

export default function LiveStats({ system = "wms" }: LiveStatsProps) {
  const config = SYSTEM_CONFIG[system];
  const { url: apiUrl, label: systemLabel, port, items: statItems } = config;

  const [stats, setStats] = useState<WmsStats | PosStats | CrmStats | TmsStats | ImsStats | ScmsStats | PmsStats | DashStats | ShopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/public/stats`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      setStats(await res.json());
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shell = "relative overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)]";
  const cols = statItems.length % 3 === 0 || statItems.length > 6 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2";

  if (loading) {
    return (
      <div className={shell} aria-busy="true">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] motion-safe:animate-pulse" aria-hidden="true" />
          <span className="font-mono text-2xs uppercase tracking-[0.12em] text-[var(--text-3)]">Connecting to {systemLabel}…</span>
        </div>
        <div className={`grid gap-px bg-[var(--border)] ${cols}`}>
          {Array.from({ length: statItems.length }).map((_, i) => (
            <div key={i} className="bg-[var(--surface)] px-5 py-4" aria-hidden="true">
              <div className="skeleton-luxury mb-2.5 h-3 w-16 rounded" />
              <div className="skeleton-luxury h-6 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (offline) {
    return (
      <div className={`${shell} px-5 py-5`}>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-4)]" aria-hidden="true" />
          <span className="font-mono text-2xs uppercase tracking-[0.12em] text-[var(--text-2)]">{systemLabel} offline</span>
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-3)]">
          {/* A visitor to the deployed shop cannot start anything, and telling
              them to run a server on a port reads as a broken page on a sales
              screen. The developer instruction is kept for development, where
              it is the useful thing to say. */}
          {process.env.NODE_ENV === "production"
            ? `The live ${systemLabel} demo is temporarily unreachable. Everything else on this page is unaffected.`
            : `The ${systemLabel} system is currently offline. Start the server on port ${port} to see live statistics.`}
        </p>
      </div>
    );
  }

  const statusText = system === "wms" && (stats as WmsStats)?.systemStatus === "operational" ? "Operational" : system !== "wms" ? "Online" : "";

  return (
    <div className={shell}>
      <div className="absolute inset-x-[20%] top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
          </span>
          <span className="font-mono text-2xs uppercase tracking-[0.12em] text-[var(--text-2)]">Live {systemLabel} statistics</span>
        </div>
        {statusText && <span className="font-mono text-2xs text-[var(--green)]">{statusText}</span>}
      </div>
      <dl className={`grid gap-px bg-[var(--border)] ${cols}`}>
        {(statItems as { key: string; label: string }[]).map(({ key, label }) => {
          const value = (stats as unknown as Record<string, unknown>)?.[key];
          const displayValue =
            typeof value === "number"
              ? key === "todaySales" || key === "pipelineValue"
                ? `฿${value.toLocaleString()}`
                : key === "onTimeRate"
                  ? `${value}%`
                  : value.toLocaleString()
              : "0";
          return (
            <div key={key} className="flex flex-col-reverse bg-[var(--surface)] px-5 py-4 transition-colors duration-150 hover:bg-[var(--surface-2)]">
              <dt className="mt-1.5 font-mono text-2xs text-[var(--text-3)]">{label}</dt>
              <dd className="display text-silver pb-[0.06em] text-2xl tabular-nums">{displayValue}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
