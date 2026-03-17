/**
 * KPI Card — healthcare white theme.
 *
 * Layout:
 *   +---------------------------------+
 *   | LABEL                  ^ 6.7%   |
 *   |                       Increase  |
 *   | 157,367                         |
 *   |                                 |
 *   | (sparkline)                     |
 *   +---------------------------------+
 */
"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  sparkline?: number[];
  sparklineType?: "bar" | "line" | "area";
  color?: string;
  accentHex?: string;
}

export default function KpiCard({
  label,
  value,
  trend,
  sparkline,
  sparklineType = "bar",
  color = "text-blue-600",
  accentHex = "#2563eb",
}: KpiCardProps) {
  const chartData = sparkline?.map((v, i) => ({ i, v })) ?? [];

  const trendColor =
    trend?.direction === "up" ? "text-emerald-600" : "text-red-500";
  const trendBg =
    trend?.direction === "up"
      ? "bg-emerald-50 border-emerald-200"
      : "bg-red-50 border-red-200";

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      {/* Header: label + trend */}
      <div className="relative flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${trendBg} ${trendColor}`}
          >
            {trend.direction === "up" ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className={`mt-3 font-mono text-3xl font-extrabold ${color}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>

      {/* Sparkline */}
      {chartData.length > 0 && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            {sparklineType === "bar" ? (
              <BarChart data={chartData} barCategoryGap="20%">
                <Bar
                  dataKey="v"
                  fill={accentHex}
                  radius={[2, 2, 0, 0]}
                  opacity={0.7}
                />
              </BarChart>
            ) : sparklineType === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentHex} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={accentHex} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={accentHex}
                  strokeWidth={2}
                  fill={`url(#grad-${label})`}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={accentHex}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
