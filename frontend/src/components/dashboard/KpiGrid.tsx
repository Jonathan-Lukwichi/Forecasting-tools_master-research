/**
 * KPI Grid — 4-card row — healthcare white theme.
 */
"use client";

import KpiCard from "./KpiCard";

interface KpiGridProps {
  todayForecast: number;
  weekTotal: number;
  peakDay: number;
  peakDayName: string;
  historicalAvg: number;
  hasForecast: boolean;
  hasHistorical: boolean;
  forecastTrend?: number[];
  dailyPattern?: number[];
}

export default function KpiGrid({
  todayForecast,
  weekTotal,
  peakDay,
  peakDayName,
  historicalAvg,
  hasForecast,
  hasHistorical,
  forecastTrend = [],
  dailyPattern = [],
}: KpiGridProps) {
  const avgTrendPct = hasHistorical && historicalAvg > 0
    ? parseFloat((((todayForecast - historicalAvg) / historicalAvg) * 100).toFixed(1))
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Today's Forecast */}
      <KpiCard
        label="Day 1 Forecast"
        value={hasForecast ? todayForecast : "\u2014"}
        trend={
          hasForecast && avgTrendPct !== 0
            ? { value: Math.abs(avgTrendPct), direction: avgTrendPct > 0 ? "up" : "down" }
            : undefined
        }
        sparkline={forecastTrend.length > 0 ? forecastTrend : undefined}
        sparklineType="bar"
        color="text-blue-600"
        accentHex="#2563eb"
      />

      {/* Card 2: 7-Day Total */}
      <KpiCard
        label="7-Day Total"
        value={hasForecast ? weekTotal : "\u2014"}
        trend={
          hasForecast && hasHistorical
            ? {
                value: parseFloat(
                  Math.abs(((weekTotal - historicalAvg * 7) / (historicalAvg * 7)) * 100).toFixed(1)
                ),
                direction: weekTotal > historicalAvg * 7 ? "up" : "down",
              }
            : undefined
        }
        sparkline={forecastTrend.length > 0 ? forecastTrend : undefined}
        sparklineType="line"
        color="text-sky-500"
        accentHex="#0ea5e9"
      />

      {/* Card 3: Peak Day */}
      <KpiCard
        label="Peak Day"
        value={hasForecast ? peakDay : "\u2014"}
        trend={
          hasForecast && hasHistorical
            ? {
                value: parseFloat(
                  Math.abs(((peakDay - historicalAvg) / historicalAvg) * 100).toFixed(1)
                ),
                direction: peakDay > historicalAvg ? "up" : "down",
              }
            : undefined
        }
        sparkline={dailyPattern.length > 0 ? dailyPattern : undefined}
        sparklineType="area"
        color="text-amber-500"
        accentHex="#f59e0b"
      />

      {/* Card 4: Historical Average */}
      <KpiCard
        label="Historical Avg"
        value={hasHistorical ? Math.round(historicalAvg) : "\u2014"}
        sparkline={dailyPattern.length > 0 ? dailyPattern : undefined}
        sparklineType="bar"
        color="text-violet-500"
        accentHex="#8b5cf6"
      />
    </div>
  );
}
