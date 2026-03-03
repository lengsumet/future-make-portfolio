"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyView, PageStat } from "@/types/analytics";

interface LineChartProps {
  data: DailyView[];
  title: string;
}

export const PageViewsChart: React.FC<LineChartProps> = ({ data, title }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#F3F4F6" }}
            itemStyle={{ color: "#A78BFA" }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#9333ea"
            strokeWidth={2}
            dot={{ fill: "#9333ea", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TopPagesChartProps {
  data: PageStat[];
  title: string;
}

export const TopPagesChart: React.FC<TopPagesChartProps> = ({ data, title }) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <YAxis type="category" dataKey="page" tick={{ fill: "#9CA3AF", fontSize: 12 }} width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }}
            labelStyle={{ color: "#F3F4F6" }}
            itemStyle={{ color: "#60A5FA" }}
          />
          <Bar dataKey="views" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
