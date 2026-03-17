/**
 * Dashboard page — Figma-inspired KPI cards + charts.
 * Fetches data from FastAPI backend.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getMe, getDashboardKPIs, listDatasets, type DashboardKPIs, type UserInfo } from "@/lib/api";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KpiGrid from "@/components/dashboard/KpiGrid";
import StatusBar from "@/components/dashboard/StatusBar";
import ChartCard from "@/components/dashboard/ChartCard";

// Demo data when no dataset is loaded
const DEMO_KPIS: DashboardKPIs = {
  today_forecast: 142,
  week_total_forecast: 987,
  peak_day_forecast: 168,
  peak_day_name: "Monday",
  forecast_model_name: "LSTM + XGBoost",
  forecast_dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  historical_avg_ed: 128,
  historical_max_ed: 195,
  historical_min_ed: 67,
  total_records: 365,
  best_model_name: "LSTM+XGB",
  best_model_mape: 4.2,
  best_model_rmse: 8.7,
  models_trained: 5,
  category_distribution: [
    { name: "Respiratory", value: 22, color: "#22d3ee" },
    { name: "Cardiac", value: 18, color: "#3b82f6" },
    { name: "Trauma", value: 15, color: "#f59e0b" },
    { name: "GI", value: 14, color: "#a78bfa" },
    { name: "Infectious", value: 12, color: "#ef4444" },
    { name: "Neurological", value: 10, color: "#10b981" },
    { name: "Other", value: 9, color: "#64748b" },
  ],
  staff_coverage_pct: 94.5,
  total_staff_needed: 47,
  overtime_hours: 12.5,
  daily_staff_cost: 18400,
  supply_service_level: 98.2,
  supply_total_cost: 4520,
  supply_weekly_savings: 340,
  supply_items_count: 24,
  supply_reorder_alerts: 3,
  forecast_trend: [
    { date: "Mon", actual: 132, type: "historical" },
    { date: "Tue", actual: 118, type: "historical" },
    { date: "Wed", actual: 145, type: "historical" },
    { date: "Thu", actual: 138, type: "historical" },
    { date: "Fri", actual: 155, type: "historical" },
    { date: "Sat", actual: 110, type: "historical" },
    { date: "Sun", actual: 95, type: "historical" },
  ],
  daily_ed_pattern: [
    { day: "Mon", avg_ed: 142 },
    { day: "Tue", avg_ed: 128 },
    { day: "Wed", avg_ed: 135 },
    { day: "Thu", avg_ed: 131 },
    { day: "Fri", avg_ed: 148 },
    { day: "Sat", avg_ed: 108 },
    { day: "Sun", avg_ed: 92 },
  ],
  model_comparison: [],
  has_forecast: true,
  has_historical: true,
  has_models: true,
  has_staff_plan: true,
  has_supply_plan: true,
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs>(DEMO_KPIS);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const me = await getMe();
        setUser(me);

        // Try to load real data
        const datasets = await listDatasets();
        if (datasets.length > 0) {
          const realKpis = await getDashboardKPIs(datasets[0].dataset_id);
          setKpis(realKpis);
          setIsDemo(false);
        }
      } catch {
        router.push("/login");
        return;
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  const sparklineTrend = kpis.forecast_trend.map(
    (d) => (d as { actual?: number }).actual ?? 0
  );
  const sparklinePattern = kpis.daily_ed_pattern.map((d) => d.avg_ed);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <DashboardHeader
          title="HealthForecast AI Dashboard"
          subtitle="Hospital demand forecasting and resource optimization"
          userName={user?.name}
        />

        {/* Demo banner */}
        {isDemo && (
          <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-2 text-sm text-amber-400">
            Showing demo data — upload a dataset via the API to see real metrics.
          </div>
        )}

        {/* Status indicators */}
        <StatusBar
          items={[
            { label: "Historical", active: kpis.has_historical, detail: `${kpis.total_records} days` },
            { label: "Forecast", active: kpis.has_forecast, detail: kpis.forecast_model_name },
            { label: "Models", active: kpis.has_models, detail: `${kpis.models_trained} trained` },
            { label: "Staff Plan", active: kpis.has_staff_plan },
            { label: "Supply Plan", active: kpis.has_supply_plan },
          ]}
        />

        {/* KPI Cards — Figma layout */}
        <KpiGrid
          todayForecast={kpis.today_forecast}
          weekTotal={kpis.week_total_forecast}
          peakDay={kpis.peak_day_forecast}
          peakDayName={kpis.peak_day_name}
          historicalAvg={kpis.historical_avg_ed}
          hasForecast={kpis.has_forecast}
          hasHistorical={kpis.has_historical}
          forecastTrend={sparklineTrend}
          dailyPattern={sparklinePattern}
        />

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Patient arrivals trend */}
          <ChartCard title="Patient Arrivals — Trend" icon="📈" className="lg:col-span-2">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={kpis.forecast_trend.map((d) => ({
                    date: (d as { date: string }).date,
                    patients: (d as { actual?: number }).actual ?? 0,
                  }))}
                >
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="patients"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#22d3ee" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Day-of-week pattern */}
          <ChartCard title="Day-of-Week Pattern" icon="📅">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpis.daily_ed_pattern}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="avg_ed"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Secondary stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Hist. Max", value: kpis.historical_max_ed, color: "text-red-400" },
            { label: "Hist. Min", value: kpis.historical_min_ed, color: "text-cyan-400" },
            { label: "Best Model", value: kpis.best_model_name, color: "text-amber-400" },
            { label: "MAPE", value: `${kpis.best_model_mape}%`, color: "text-emerald-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-4"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </div>
              <div className={`mt-1 font-mono text-lg font-bold ${stat.color}`}>
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
