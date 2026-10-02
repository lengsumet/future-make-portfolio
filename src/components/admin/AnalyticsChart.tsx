"use client";

import React, { useId } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyView, PageStat } from "@/types/analytics";

/* Recharts paints SVG attributes, which resolve var() like CSS does, so the
   chart follows the same tokens as the rest of the page. */
const tick = { fill: "var(--text-3)", fontSize: 11, fontFamily: "var(--mono-stack)" };

interface TipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ value?: number | string }>;
}

function ChartTooltip({ active, label, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-mid)] bg-[var(--surface-2)] px-3 py-2 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.8)]">
      <p className="font-mono text-2xs" style={{ color: "var(--text-3)" }}>
        {label}
      </p>
      <p className="mt-0.5 font-mono text-sm" style={{ color: "var(--text-1)" }}>
        {Number(payload[0].value ?? 0).toLocaleString("en-US")} <span style={{ color: "var(--text-3)" }}>views</span>
      </p>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)]">
      <h3 className="eyebrow border-b border-[var(--border)] px-6 py-4">{title}</h3>
      <div className="px-4 pb-4 pt-5">{children}</div>
    </section>
  );
}

interface LineChartProps {
  data: DailyView[];
  title: string;
}

// The analytics endpoint sends each day as { date, count }; the type says
// { date, views }. Read either so the line is drawn whichever arrives.
const dayViews = (d: DailyView & { count?: number }) => d.views ?? d.count ?? 0;

export const PageViewsChart: React.FC<LineChartProps> = ({ data, title }) => {
  // useId returns characters url(#…) cannot carry; keep the safe ones.
  const gradient = `pv-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <ChartPanel title={title}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="date" tick={tick} axisLine={false} tickLine={false} tickMargin={10} />
          <YAxis
            tick={tick}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, (max: number) => Math.max(4, Math.ceil(max * 1.25))]}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-mid)" }} />
          <Area
            type="monotone"
            dataKey={dayViews}
            name="Views"
            stroke="var(--accent-3)"
            strokeWidth={2}
            fill={`url(#${gradient})`}
            dot={data.length < 3 ? { r: 3.5, fill: "var(--accent-3)", stroke: "var(--surface)", strokeWidth: 2 } : false}
            activeDot={{ r: 4.5, fill: "var(--text-1)", stroke: "var(--accent)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
};

interface TopPagesChartProps {
  data: PageStat[];
  title: string;
}

const shortPath = (p: string) => (p.length > 22 ? `…${p.slice(-21)}` : p);

export const TopPagesChart: React.FC<TopPagesChartProps> = ({ data, title }) => {
  return (
    <ChartPanel title={title}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barCategoryGap={4}>
          <CartesianGrid stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tick={tick} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="page"
            tick={tick}
            axisLine={false}
            tickLine={false}
            width={150}
            interval={0}
            tickFormatter={shortPath}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,248,240,0.03)" }} />
          <Bar dataKey="views" name="Views" fill="var(--accent)" radius={[0, 6, 6, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
};
