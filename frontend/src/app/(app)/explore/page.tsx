/**
 * Explore Data page — EDA visualizations and statistics.
 *
 * === TRIANGULATION RECORD ===
 * Task: EDA dashboard with charts for time series dataset exploration
 * Approach: Recharts bar/pie charts for DOW, monthly patterns, correlations
 *
 * Vertex 1 (Academic):
 *   Source: Hyndman & Athanasopoulos (2021). "Forecasting: Principles and Practice", Ch.2.
 *   Finding: Time series EDA should include: seasonal plots (DOW, month),
 *            autocorrelation, distribution of target, and correlation with external vars
 *   Relevance: Directly maps to our DOW, monthly, correlation, and summary stats panels
 *
 * Vertex 2 (Industry):
 *   Source: https://www.kaggle.com/code/raminhuseyn/time-series-forecasting-exploratory-data-analysis
 *   Pattern: Summary stats → distribution → seasonal patterns → correlations → missing data
 *   Adaptation: Same EDA structure rendered with Recharts instead of matplotlib
 *
 * Vertex 3 (Internal):
 *   Files checked: pages/04_Explore_Data.py (DOW donuts, weather correlation, FFT)
 *   Files checked: frontend/src/components/dashboard/ChartCard.tsx (reusable card)
 *   Consistency: Confirmed — replicates same EDA panels via /api/data/explore endpoint
 *
 * Verdict: PROCEED
 * =============================
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  AlertCircle,
  ArrowRight,
  Table2,
  PieChart as PieIcon,
  TrendingUp,
  Database,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getMe,
  listDatasets,
  exploreDataset,
  type DatasetInfo,
  type EDAResponse,
} from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

const COLORS = ["#3b82f6", "#0ea5e9", "#8b5cf6", "#f43f5e", "#22c55e", "#eab308", "#f97316", "#ec4899", "#6366f1", "#14b8a6", "#f59e0b", "#ef4444"];

export default function ExplorePage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eda, setEda] = useState<EDAResponse | null>(null);
  const [tab, setTab] = useState<"overview" | "columns" | "patterns" | "correlations">("overview");

  useEffect(() => {
    getMe().catch(() => router.push("/login"));
    listDatasets().then((ds) => {
      setDatasets(ds);
      // Auto-select fused dataset if available
      const fused = ds.find((d) => (d.metadata as Record<string, string>)?.type === "fused");
      if (fused) setSelectedId(fused.dataset_id);
    });
  }, [router]);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    exploreDataset(selectedId)
      .then(setEda)
      .catch((err) => setError(err instanceof Error ? err.message : "EDA failed"))
      .finally(() => setLoading(false));
  }, [selectedId]);

  // Transform data for charts
  const dowData = eda
    ? Object.entries(eda.dow_averages).map(([day, avg]) => ({ day: day.slice(0, 3), avg: Math.round(avg) }))
    : [];

  const monthData = eda
    ? Object.entries(eda.monthly_averages).map(([month, avg]) => ({ month: month.slice(0, 3), avg: Math.round(avg) }))
    : [];

  const corrData = eda
    ? Object.entries(eda.correlations)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .map(([col, val]) => ({ column: col.length > 15 ? col.slice(0, 15) + "…" : col, correlation: Number(val.toFixed(3)) }))
    : [];

  const missingData = eda
    ? Object.entries(eda.missing_by_column)
        .filter(([, pct]) => pct > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([col, pct]) => ({ column: col, pct }))
    : [];

  const pieData = dowData.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));

  const TabButton = ({ id, label, icon }: { id: typeof tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
        tab === id ? "bg-blue-50 text-blue-600 border border-blue-200" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Explore Data</h1>
            <p className="mt-1 text-sm text-slate-500">Exploratory data analysis and visualizations</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/prepare")} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300">
              Prepare
            </button>
            <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300">
              Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Dataset selector */}
        <div className="flex items-center gap-3">
          <Database size={16} className="text-slate-400" />
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
          >
            <option value="">— Select dataset —</option>
            {datasets.map((d) => (
              <option key={d.dataset_id} value={d.dataset_id}>
                {(d.metadata as Record<string, string>)?.type || "dataset"} · {d.dataset_id.slice(0, 8)}… ({d.rows} rows)
              </option>
            ))}
          </select>
          {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {eda && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: "Rows", value: eda.rows.toLocaleString() },
                { label: "Columns", value: eda.columns },
                { label: "Target Mean", value: eda.target_stats.mean?.toFixed(1) ?? "—" },
                { label: "Target Std", value: eda.target_stats.std?.toFixed(1) ?? "—" },
                { label: "Missing Cols", value: Object.keys(eda.missing_by_column).length },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-800">{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <TabButton id="overview" label="Overview" icon={<BarChart3 size={13} />} />
              <TabButton id="columns" label="Columns" icon={<Table2 size={13} />} />
              <TabButton id="patterns" label="Patterns" icon={<PieIcon size={13} />} />
              <TabButton id="correlations" label="Correlations" icon={<TrendingUp size={13} />} />
            </div>

            {/* Tab content */}
            {tab === "overview" && (
              <div className="grid gap-4 lg:grid-cols-2">
                {/* DOW Bar Chart */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">Average Arrivals by Day of Week</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dowData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#334155" }}
                      />
                      <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Bar Chart */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">Average Arrivals by Month</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#334155" }}
                      />
                      <Bar dataKey="avg" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {tab === "columns" && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {["Column", "Type", "Non-null", "Null %", "Unique", "Mean", "Std", "Min", "Max"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {eda.column_summaries.map((col) => (
                      <tr key={col.name} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-medium text-slate-800">{col.name}</td>
                        <td className="px-3 py-1.5 text-slate-500">{col.dtype}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{col.non_null}</td>
                        <td className={`px-3 py-1.5 font-mono ${col.null_pct > 5 ? "text-red-500" : "text-slate-600"}`}>{col.null_pct}%</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{col.unique}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{col.mean?.toFixed(2) ?? "—"}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{col.std?.toFixed(2) ?? "—"}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{col.min?.toFixed(2) ?? "—"}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{col.max?.toFixed(2) ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "patterns" && (
              <div className="grid gap-4 lg:grid-cols-2">
                {/* DOW Pie */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">Day-of-Week Distribution</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={pieData} dataKey="avg" nameKey="day" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#334155" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Missing data */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">Missing Data (Top 10)</h3>
                  {missingData.length === 0 ? (
                    <div className="flex h-[250px] items-center justify-center text-sm text-slate-500">No missing data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={missingData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                        <YAxis dataKey="column" type="category" tick={{ fill: "#64748b", fontSize: 11 }} width={120} />
                        <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#334155" }} />
                        <Bar dataKey="pct" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Target stats */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">Target Variable Statistics</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(eda.target_stats).map(([key, val]) => (
                      <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                        <div className="text-[11px] font-semibold uppercase text-slate-500">{key}</div>
                        <div className="mt-1 font-mono text-lg font-bold text-blue-600">{val.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "correlations" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-800">Top Correlations with Target</h3>
                {corrData.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">No numeric correlations found</div>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(300, corrData.length * 35)}>
                    <BarChart data={corrData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" domain={[-1, 1]} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="column" type="category" tick={{ fill: "#64748b", fontSize: 11 }} width={140} />
                      <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#334155" }} />
                      <Bar dataKey="correlation" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {corrData.map((entry, i) => (
                          <Cell key={i} fill={entry.correlation >= 0 ? "#3b82f6" : "#f43f5e"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </>
        )}

        {!eda && !loading && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <BarChart3 size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">Select a dataset above to explore</p>
            <p className="mt-1 text-xs text-slate-400">Upload and fuse data first if you haven&apos;t already</p>
          </div>
        )}
      </div>
    </div>
  );
}
