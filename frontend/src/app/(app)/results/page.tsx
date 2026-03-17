/**
 * Model Results page — compare trained models, view metrics.
 *
 * === TRIANGULATION RECORD ===
 * Task: Model comparison dashboard
 * Approach: Fetch model comparison from API, display ranked table + bar charts
 *
 * Vertex 1 (Academic):
 *   Source: Hyndman & Athanasopoulos (2021). "Forecasting: Principles and Practice", Ch.5.
 *   Finding: Model comparison should use multiple metrics (RMSE, MAE, MAPE) and
 *            rank by the primary metric while showing all others.
 *
 * Vertex 2 (Industry):
 *   Source: https://www.kaggle.com/code/anshuls235/time-series-forecasting-eda-fe-modelling
 *   Pattern: Comparison table ranked by metric + bar chart visualization.
 *
 * Vertex 3 (Internal):
 *   Files checked: pages/09_Model_Results.py, api/routes/models.py (compare endpoint)
 *   Consistency: Confirmed — GET /api/models/compare/{dataset_id} returns ranked models
 *
 * Verdict: PROCEED
 * =============================
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  ArrowRight,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getMe,
  listDatasets,
  getModelComparison,
  type DatasetInfo,
  type ModelComparison,
} from "@/lib/api";

const METRIC_COLORS: Record<string, string> = {
  rmse: "#3b82f6",
  mae: "#22d3ee",
  mape: "#a78bfa",
};

export default function ResultsPage() {
  const router = useRouter();

  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [comparison, setComparison] = useState<ModelComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rankMetric, setRankMetric] = useState("rmse");

  useEffect(() => {
    getMe().catch(() => router.push("/login"));
    listDatasets().then((ds) => {
      setDatasets(ds);
      const fused = ds.find((d) => (d.metadata as Record<string, string>)?.type === "fused");
      if (fused) setSelectedId(fused.dataset_id);
    });
  }, [router]);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    getModelComparison(selectedId, rankMetric)
      .then(setComparison)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [selectedId, rankMetric]);

  const chartData = comparison?.models.map((m) => ({
    name: m.model_type,
    rmse: m.metrics.rmse,
    mae: m.metrics.mae,
    mape: m.metrics.mape,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Model Results</h1>
            <p className="mt-1 text-sm text-slate-400">Compare trained models and select the best performer</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/train")} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:border-white/[0.15]">
              Train
            </button>
            <button onClick={() => router.push("/forecast")} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:border-white/[0.15]">
              Forecast <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
          >
            <option value="">— Select dataset —</option>
            {datasets.map((d) => (
              <option key={d.dataset_id} value={d.dataset_id}>
                {(d.metadata as Record<string, string>)?.type || "dataset"} · {d.dataset_id.slice(0, 8)}…
              </option>
            ))}
          </select>

          <select
            value={rankMetric}
            onChange={(e) => setRankMetric(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
          >
            <option value="rmse">Rank by RMSE</option>
            <option value="mae">Rank by MAE</option>
            <option value="mape">Rank by MAPE</option>
          </select>

          {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {comparison && comparison.models.length > 0 ? (
          <>
            {/* Best model card */}
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" />
                <span className="text-sm font-bold text-white">
                  Best Model: {comparison.models[0].model_type.toUpperCase()}
                </span>
                <span className="ml-2 rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                  RMSE {comparison.models[0].metrics.rmse.toFixed(2)}
                </span>
                <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
                  MAE {comparison.models[0].metrics.mae.toFixed(2)}
                </span>
                <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-xs font-semibold text-violet-400">
                  MAPE {comparison.models[0].metrics.mape.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-slate-800/50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-400">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-400">Model</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">RMSE</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">MAE</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">MAPE %</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">Time (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.models.map((m, i) => (
                    <tr key={m.model_id} className={`border-b border-white/[0.04] hover:bg-slate-800/30 ${i === 0 ? "bg-emerald-400/5" : ""}`}>
                      <td className="px-4 py-2.5 font-mono text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-white">{m.model_type.toUpperCase()}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-white">{m.metrics.rmse.toFixed(4)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-white">{m.metrics.mae.toFixed(4)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-white">{m.metrics.mape.toFixed(4)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">{m.training_time.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Metrics bar chart */}
            <div className="grid gap-4 lg:grid-cols-3">
              {(["rmse", "mae", "mape"] as const).map((metric) => (
                <div key={metric} className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-4">
                  <h3 className="mb-3 text-sm font-bold text-white">{metric.toUpperCase()}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={80} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }} />
                      <Bar dataKey={metric} radius={[0, 4, 4, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? "#22c55e" : METRIC_COLORS[metric]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </>
        ) : (
          !loading && !error && (
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-12 text-center">
              <BarChart3 size={40} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-500">No trained models found for this dataset.</p>
              <button
                onClick={() => router.push("/train")}
                className="mt-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Train Models
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
