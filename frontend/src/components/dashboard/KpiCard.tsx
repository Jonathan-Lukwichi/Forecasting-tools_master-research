/**
 * KPI Card — Figma-inspired design adapted for dark theme.
 *
 * Layout matches the Figma "01_Dashboard_Vertical":
 *   ┌──────────────────────────────────┐
 *   │ LABEL                  ↑ 6.7%   │
 *   │                       Increase   │
 *   │ 157,367                          │
 *   │                                  │
 *   │ ▂▅▇▃▆▅▇▂▅▇  (sparkline)         │
 *   └──────────────────────────────────┘
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
    value: number; // e.g. 6.7
    direction: "up" | "down";
  };
  sparkline?: number[];
  sparklineType?: "bar" | "line" | "area";
  color?: string; // tailwind color class or hex
  accentHex?: string; // hex for sparkline
}

export default function KpiCard({
  label,
  value,
  trend,
  sparkline,
  sparklineType = "bar",
  color = "text-cyan-400",
  accentHex = "#22d3ee",
}: KpiCardProps) {
  const chartData = sparkline?.map((v, i) => ({ i, v })) ?? [];

  const trendColor =
    trend?.direction === "up" ? "text-emerald-400" : "text-red-400";
  const trendBg =
    trend?.direction === "up"
      ? "bg-emerald-400/10 border-emerald-400/20"
      : "bg-red-400/10 border-red-400/20";

  return (
    <div className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900/80 via-slate-900/95 to-slate-800/80 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:shadow-lg hover:shadow-cyan-500/5">
      {/* Shimmer overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -left-full top-0 h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      </div>

      {/* Header: label + trend */}
      <div className="relative flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
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
