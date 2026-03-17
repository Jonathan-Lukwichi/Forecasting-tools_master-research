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
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

const METRIC_COLORS: Record<string, string> = {
  rmse: "#3b82f6",
  mae: "#0ea5e9",
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <PageHeader
          title="Model Results"
          description="Compare model performance and select the best forecasting approach"
          icon={Trophy}
          badge="Step 5"
          accentColor="amber"
          images={["/images/results-bg.jpg"]}
        />
        <div className="flex justify-end gap-2 -mt-2">
          <button onClick={() => router.push("/train")} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50">
            Train
          </button>
          <button onClick={() => router.push("/forecast")} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50">
            Forecast <ArrowRight size={14} />
          </button>
        </div>

        <FadeIn delay={0.15}>
        {/* Controls */}
        <div className="flex items-center gap-4">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
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
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
          >
            <option value="rmse">Rank by RMSE</option>
            <option value="mae">Rank by MAE</option>
            <option value="mape">Rank by MAPE</option>
          </select>

          {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {comparison && comparison.models.length > 0 ? (
          <>
            {/* Best model card */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                <span className="text-sm font-bold text-slate-800">
                  Best Model: {comparison.models[0].model_type.toUpperCase()}
                </span>
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  RMSE {comparison.models[0].metrics.rmse.toFixed(2)}
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                  MAE {comparison.models[0].metrics.mae.toFixed(2)}
                </span>
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-600">
                  MAPE {comparison.models[0].metrics.mape.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Model</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">RMSE</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">MAE</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">MAPE %</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Time (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.models.map((m, i) => (
                    <tr key={m.model_id} className={`border-b border-slate-100 hover:bg-slate-50 ${i === 0 ? "bg-emerald-50" : ""}`}>
                      <td className="px-4 py-2.5 font-mono text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{m.model_type.toUpperCase()}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-800">{m.metrics.rmse.toFixed(4)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-800">{m.metrics.mae.toFixed(4)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-800">{m.metrics.mape.toFixed(4)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-500">{m.training_time.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Metrics bar chart */}
            <div className="grid gap-4 lg:grid-cols-3">
              {(["rmse", "mae", "mape"] as const).map((metric) => (
                <div key={metric} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">{metric.toUpperCase()}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "#64748b", fontSize: 11 }} width={80} />
                      <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#334155" }} />
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
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <BarChart3 size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No trained models found for this dataset.</p>
              <button
                onClick={() => router.push("/train")}
                className="mt-3 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Train Models
              </button>
            </div>
          )
        )}
        </FadeIn>
      </div>
    </div>
  );
}
