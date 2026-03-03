"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: string;
}

interface DashboardStatsProps {
  stats: StatCard[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <p className={`text-2xl font-bold ${stat.color || "text-white"}`}>{stat.value}</p>
          <p className="text-sm text-gray-400 mt-0.5">{stat.label}</p>
          {stat.sub && <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>}
        </motion.div>
      ))}
    </div>
  );
};
