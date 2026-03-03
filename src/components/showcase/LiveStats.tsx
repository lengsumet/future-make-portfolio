"use client";

import React, { useState, useEffect } from "react";

// ==========================================
// WMS Stats
// ==========================================

interface WmsStats {
  totalProducts: number;
  totalInventoryItems: number;
  totalInboundOrders: number;
  totalOutboundOrders: number;
  totalWarehouses: number;
  totalZones: number;
  totalBins: number;
  totalUsers: number;
  totalPickLists: number;
  systemStatus: string;
}

const WMS_URL =
  process.env.NEXT_PUBLIC_WMS_URL || "http://localhost:3001";

const wmsStatItems: { key: keyof WmsStats; label: string; icon: string }[] = [
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

// ==========================================
// POS Stats
// ==========================================

interface PosStats {
  totalProducts: number;
  totalCategories: number;
  totalTransactions: number;
  totalCustomers: number;
  todaySales: number;
  todayTransactions: number;
}

const POS_URL =
  process.env.NEXT_PUBLIC_POS_URL || "http://localhost:3002";

const posStatItems: { key: keyof PosStats; label: string; icon: string }[] = [
  { key: "totalProducts", label: "Products", icon: "☕" },
  { key: "totalCategories", label: "Categories", icon: "📂" },
  { key: "totalTransactions", label: "Transactions", icon: "🧾" },
  { key: "totalCustomers", label: "Customers", icon: "👥" },
  { key: "todaySales", label: "Today Sales (฿)", icon: "💰" },
  { key: "todayTransactions", label: "Today Orders", icon: "📊" },
];

// ==========================================
// CRM Stats
// ==========================================

interface CrmStats {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  activeDeals: number;
  pipelineValue: number;
  wonThisMonth: number;
}

const CRM_URL =
  process.env.NEXT_PUBLIC_CRM_URL || "http://localhost:3003";

const crmStatItems: { key: keyof CrmStats; label: string; icon: string }[] = [
  { key: "totalContacts", label: "Contacts", icon: "👤" },
  { key: "totalCompanies", label: "Companies", icon: "🏢" },
  { key: "totalDeals", label: "Total Deals", icon: "🤝" },
  { key: "activeDeals", label: "Active Deals", icon: "📈" },
  { key: "pipelineValue", label: "Pipeline Value (฿)", icon: "💰" },
  { key: "wonThisMonth", label: "Won This Month", icon: "🏆" },
];

// ==========================================
// Generic Stats Panel
// ==========================================

interface LiveStatsProps {
  system?: "wms" | "pos" | "crm";
}

export default function LiveStats({ system = "wms" }: LiveStatsProps) {
  const isWms = system === "wms";
  const isCrm = system === "crm";
  const apiUrl = isWms ? WMS_URL : isCrm ? CRM_URL : POS_URL;
  const systemLabel = isWms ? "WMS" : isCrm ? "CRM" : "POS";
  const accentColor = isWms ? "indigo" : isCrm ? "amber" : "emerald";

  const [stats, setStats] = useState<WmsStats | PosStats | CrmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/public/stats`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
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
  }, []);

  const statItems = isWms ? wmsStatItems : isCrm ? crmStatItems : posStatItems;
  const gridCols = "grid-cols-3";

  if (loading) {
    return (
      <div className="bg-gray-800/40 rounded-xl p-6 my-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-sm text-gray-400">
            Connecting to {systemLabel}...
          </span>
        </div>
        <div className={`grid ${gridCols} gap-3`}>
          {Array.from({ length: statItems.length }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-700/40 rounded-lg p-3 animate-pulse"
            >
              <div className="h-3 bg-gray-600 rounded w-16 mb-2" />
              <div className="h-5 bg-gray-600 rounded w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (offline) {
    const port = isWms ? "3001" : isCrm ? "3003" : "3002";
    return (
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 my-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <span className="text-sm font-medium text-gray-300">
            {systemLabel} Offline
          </span>
        </div>
        <p className="text-sm text-gray-500">
          The {systemLabel} system is currently offline. Start the {systemLabel}{" "}
          server on port {port} to see live statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full animate-pulse ${
              accentColor === "emerald" ? "bg-emerald-400" : accentColor === "amber" ? "bg-amber-400" : "bg-green-400"
            }`}
          />
          <span className="text-sm font-medium text-gray-300">
            Live {systemLabel} Statistics
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {isWms && (stats as WmsStats)?.systemStatus === "operational"
            ? "System Operational"
            : !isWms
              ? "System Online"
              : ""}
        </span>
      </div>
      <div className={`grid ${gridCols} gap-3`}>
        {(statItems as { key: string; label: string; icon: string }[]).map(
          ({ key, label, icon }) => {
            const value = (stats as unknown as Record<string, unknown>)?.[key];
            const displayValue =
              typeof value === "number"
                ? key === "todaySales" || key === "pipelineValue"
                  ? `฿${value.toLocaleString()}`
                  : value.toLocaleString()
                : "0";
            return (
              <div
                key={key}
                className="bg-gray-700/30 rounded-lg p-3 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{icon}</span>
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
                <p className="text-lg font-bold text-white">{displayValue}</p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
