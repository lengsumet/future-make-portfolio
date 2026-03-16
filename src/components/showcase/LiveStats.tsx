"use client";

import React, { useState, useEffect } from "react";

interface WmsStats { totalProducts: number; totalInventoryItems: number; totalInboundOrders: number; totalOutboundOrders: number; totalWarehouses: number; totalZones: number; totalBins: number; totalUsers: number; totalPickLists: number; systemStatus: string; }
interface PosStats { totalProducts: number; totalCategories: number; totalTransactions: number; totalCustomers: number; todaySales: number; todayTransactions: number; }
interface CrmStats { totalContacts: number; totalCompanies: number; totalDeals: number; activeDeals: number; pipelineValue: number; wonThisMonth: number; }
interface TmsStats { totalVehicles: number; totalDrivers: number; totalRoutes: number; activeShipments: number; totalDeliveries: number; onTimeRate: number; }
interface ImsStats { products: number; movements: number; warehouses: number; status: string; }
interface ScmsStats { suppliers: number; purchaseOrders: number; orders: number; risks: number; status: string; }
interface PmsStats { workOrders: number; activeWorkOrders: number; productionLines: number; machines: number; ncrs: number; status: string; }
interface DashStats { metricSnapshots: number; totalAlerts: number; activeAlerts: number; reports: number; status: string; }

const wmsStatItems = [
  { key: "totalProducts", label: "Products", icon: "📦" },
  { key: "totalInventoryItems", label: "Inventory Items", icon: "🏷️" },
  { key: "totalInboundOrders", label: "Inbound Orders", icon: "📥" },
  { key: "totalOutboundOrders", label: "Outbound Orders", icon: "📤" },
  { key: "totalWarehouses", label: "Warehouses", icon: "🏭" },
  { key: "totalZones", label: "Zones", icon: "📍" },
  { key: "totalBins", label: "Storage Bins", icon: "🗄️" },
  { key: "totalUsers", label: "Users", icon: "👤" },
  { key: "totalPickLists", label: "Pick Lists", icon: "📋" },
];
const posStatItems = [
  { key: "totalProducts", label: "Products", icon: "☕" },
  { key: "totalCategories", label: "Categories", icon: "📂" },
  { key: "totalTransactions", label: "Transactions", icon: "🧾" },
  { key: "totalCustomers", label: "Customers", icon: "👥" },
  { key: "todaySales", label: "Today Sales (฿)", icon: "💰" },
  { key: "todayTransactions", label: "Today Orders", icon: "📊" },
];
const crmStatItems = [
  { key: "totalContacts", label: "Contacts", icon: "👤" },
  { key: "totalCompanies", label: "Companies", icon: "🏢" },
  { key: "totalDeals", label: "Total Deals", icon: "🤝" },
  { key: "activeDeals", label: "Active Deals", icon: "📈" },
  { key: "pipelineValue", label: "Pipeline Value (฿)", icon: "💰" },
  { key: "wonThisMonth", label: "Won This Month", icon: "🏆" },
];
const tmsStatItems = [
  { key: "totalVehicles", label: "Vehicles", icon: "🚛" },
  { key: "totalDrivers", label: "Drivers", icon: "👨‍✈️" },
  { key: "totalRoutes", label: "Routes", icon: "🗺️" },
  { key: "activeShipments", label: "Active Shipments", icon: "📦" },
  { key: "totalDeliveries", label: "Deliveries", icon: "✅" },
  { key: "onTimeRate", label: "On-Time Rate (%)", icon: "⏱️" },
];
const imsStatItems = [
  { key: "products", label: "Products", icon: "📦" },
  { key: "movements", label: "Stock Movements", icon: "🔄" },
  { key: "warehouses", label: "Warehouses", icon: "🏭" },
];
const scmsStatItems = [
  { key: "suppliers", label: "Suppliers", icon: "🏢" },
  { key: "purchaseOrders", label: "Purchase Orders", icon: "📋" },
  { key: "orders", label: "Sales Orders", icon: "🛒" },
  { key: "risks", label: "Active Risks", icon: "⚠️" },
];
const pmsStatItems = [
  { key: "workOrders", label: "Work Orders", icon: "📝" },
  { key: "activeWorkOrders", label: "Active WOs", icon: "🔧" },
  { key: "productionLines", label: "Prod. Lines", icon: "🏭" },
  { key: "machines", label: "Machines", icon: "⚙️" },
  { key: "ncrs", label: "Open NCRs", icon: "🔴" },
];
const dashStatItems = [
  { key: "metricSnapshots", label: "Metrics (30d)", icon: "📊" },
  { key: "totalAlerts", label: "Total Alerts", icon: "🔔" },
  { key: "activeAlerts", label: "Active Alerts", icon: "🚨" },
  { key: "reports", label: "Reports", icon: "📄" },
];

const SYSTEM_CONFIG = {
  wms:       { url: process.env.NEXT_PUBLIC_WMS_URL       || "http://localhost:3001", label: "WMS",       port: "3001", items: wmsStatItems },
  pos:       { url: process.env.NEXT_PUBLIC_POS_URL       || "http://localhost:3002", label: "POS",       port: "3002", items: posStatItems },
  crm:       { url: process.env.NEXT_PUBLIC_CRM_URL       || "http://localhost:3003", label: "CRM",       port: "3003", items: crmStatItems },
  tms:       { url: process.env.NEXT_PUBLIC_TMS_URL       || "http://localhost:3004", label: "TMS",       port: "3004", items: tmsStatItems },
  ims:       { url: process.env.NEXT_PUBLIC_IMS_URL       || "http://localhost:3005", label: "IMS",       port: "3005", items: imsStatItems },
  scms:      { url: process.env.NEXT_PUBLIC_SCMS_URL      || "http://localhost:3006", label: "SCMS",      port: "3006", items: scmsStatItems },
  pms:       { url: process.env.NEXT_PUBLIC_PMS_URL       || "http://localhost:3007", label: "PMS",       port: "3007", items: pmsStatItems },
  dashboard: { url: process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3008", label: "Dashboard", port: "3008", items: dashStatItems },
};

interface LiveStatsProps {
  system?: "wms" | "pos" | "crm" | "tms" | "ims" | "scms" | "pms" | "dashboard";
}

export default function LiveStats({ system = "wms" }: LiveStatsProps) {
  const config = SYSTEM_CONFIG[system];
  const { url: apiUrl, label: systemLabel, port, items: statItems } = config;

  const [stats, setStats] = useState<WmsStats | PosStats | CrmStats | TmsStats | ImsStats | ScmsStats | PmsStats | DashStats | null>(null);
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

  if (loading) {
    return (
      <div className="rounded-xl p-6 my-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Connecting to {systemLabel}...</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: statItems.length }).map((_, i) => (
            <div key={i} className="rounded-lg p-3 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="h-3 rounded w-16 mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="h-5 rounded w-10" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (offline) {
    return (
      <div className="rounded-xl p-6 my-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{systemLabel} Offline</span>
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
          The {systemLabel} system is currently offline. Start the server on port {port} to see live statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 my-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#818cf8" }} />
          <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Live {systemLabel} Statistics
          </span>
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          {system === "wms" && (stats as WmsStats)?.systemStatus === "operational" ? "Operational" : system !== "wms" ? "Online" : ""}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(statItems as { key: string; label: string; icon: string }[]).map(({ key, label, icon }) => {
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
            <div
              key={key}
              className="rounded-lg p-3 transition-colors duration-150"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.06)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{icon}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
              <p className="text-lg font-bold text-white">{displayValue}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
