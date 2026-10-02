"use client";

import React from "react";
import type { IconType } from "react-icons";
import { motion, useReducedMotion } from "framer-motion";
import SpotlightCard from "@/components/fx/SpotlightCard";
import NumberTicker from "@/components/fx/NumberTicker";

export interface StatCard {
  label: string;
  /** Whole numbers count up; anything else is shown as given. */
  value: string | number;
  prefix?: string;
  suffix?: string;
  sub?: string;
  icon: IconType;
}

interface DashboardStatsProps {
  stats: StatCard[];
}

/** KPI tiles: a lit card per figure, the figure counting up once on arrival. */
export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const reduce = useReducedMotion();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
          >
            <SpotlightCard className="h-full p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow">{stat.label}</p>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-mid)] bg-white/[0.03] text-[var(--accent-3)]">
                  <Icon size={13} aria-hidden="true" />
                </span>
              </div>
              <p className="display text-silver mt-6 pb-[0.06em] text-4xl">
                {stat.prefix}
                {typeof stat.value === "number" && Number.isInteger(stat.value) ? (
                  <NumberTicker value={stat.value} />
                ) : (
                  <span className="tabular-nums">{stat.value}</span>
                )}
                {stat.suffix}
              </p>
              {stat.sub && (
                <p className="mt-2 text-xs" style={{ color: "var(--text-3)" }}>
                  {stat.sub}
                </p>
              )}
            </SpotlightCard>
          </motion.div>
        );
      })}
    </div>
  );
};
