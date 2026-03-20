/**
 * Feature Selection page — analyze and select the most important features.
 *
 * === TRIANGULATION RECORD ===
 * Vertex 1: Hastie et al. (2009) "Elements of Statistical Learning" Ch.3 — Feature selection
 * Vertex 2: Kaggle feature selection notebooks — multiple methods comparison
 * Vertex 3: pages/06_Feature_Selection.py (correlation, permutation, lasso, GB)
 * Verdict: PROCEED
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Filter,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Loader2,
  Zap,
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
  selectFeatures,
  type DatasetInfo,
  type FeatureSelectionResponse,
  type FeatureSelectionResult,
} from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

const METHOD_INFO: Record<string, { label: string; color: string; description: string }> = {
  correlation: {
    label: "Correlation",
    color: "#3b82f6",
    description: "Pearson correlation with target variable",
  },
  permutation: {
    label: "Permutation",
    color: "#8b5cf6",
    description: "Feature importance via permutation shuffling",
  },
  lasso: {
    label: "Lasso",
    color: "#22c55e",
    description: "L1 regularization coefficient magnitudes",
  },
  gradient_boosting: {
    label: "Gradient Boosting",
    color: "#f59e0b",
    description: "Tree-based feature importance scores",
  },
};

export default function SelectionPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [topK, setTopK] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<FeatureSelectionResponse | null>(null);
  const [activeMethod, setActiveMethod] = useState<string | null>(null);

  useEffect(() => {
    getMe().catch(() => router.push("/login"));
    listDatasets().then((ds) => {
      setDatasets(ds);
      // Auto-select processed or fused dataset
      const processed = ds.find((d) => (d.metadata as Record<string, string>)?.type === "processed");
      const fused = ds.find((d) => (d.metadata as Record<string, string>)?.type === "fused");
      if (processed) setSelectedId(processed.dataset_id);
      else if (fused) setSelectedId(fused.dataset_id);
    });
  }, [router]);

  const handleRun = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    try {
      const res = await selectFeatures({
        dataset_id: selectedId,
        method: "all",
        top_k: topK,
      });
      setResponse(res);
      if (res.results.length > 0) {
        setActiveMethod(res.results[0].method);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Feature selection failed");
    } finally {
      setLoading(false);
    }
  };

  const activeResult = response?.results.find((r) => r.method === activeMethod);

  const chartData = activeResult?.importances.slice(0, 15).map((imp) => ({
    feature: imp.feature.length > 20 ? imp.feature.slice(0, 18) + "…" : imp.feature,
    importance: imp.importance,
    fullName: imp.feature,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="Feature Selection"
          description="Identify the most predictive features using multiple selection methods"
          icon={Filter}
          badge="Step 3b"
          accentColor="violet"
          images={["/images/features-bg.jpg"]}
        />

        <div className="flex justify-end -mt-2">
          <button
            onClick={() => router.push("/train")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          >
            Train Models <ArrowRight size={14} />
          </button>
        </div>

        <FadeIn delay={0.15}>
          {/* Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-800">Configuration</h2>
            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Dataset
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                >
                  <option value="">— Select —</option>
                  {datasets.map((d) => (
                    <option key={d.dataset_id} value={d.dataset_id}>
                      {(d.metadata as Record<string, string>)?.type || "dataset"} ·{" "}
                      {d.dataset_id.slice(0, 8)}… ({d.rows} rows)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Top K Features
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRun}
                  disabled={!selectedId || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Zap size={16} />
                  )}
                  Run Feature Selection
                </button>
              </div>
            </div>

            {/* Method descriptions */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(METHOD_INFO).map(([key, info]) => (
                <div
                  key={key}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {info.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">{info.description}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {response && (
            <>
              {/* Summary */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-800">
                    Analyzed {response.total_features} features targeting "{response.target_column}"
                  </span>
                </div>
              </div>

              {/* Method tabs */}
              <div className="flex gap-2 overflow-x-auto">
                {response.results.map((result) => {
                  const info = METHOD_INFO[result.method] || {
                    label: result.method,
                    color: "#64748b",
                  };
                  const isActive = activeMethod === result.method;
                  return (
                    <button
                      key={result.method}
                      onClick={() => setActiveMethod(result.method)}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-white text-slate-800 shadow-sm ring-2"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                      style={{
                        borderColor: isActive ? info.color : "transparent",
                        ...(isActive && { "--tw-ring-color": info.color } as React.CSSProperties),
                      }}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: info.color }}
                      />
                      {info.label}
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                        {result.elapsed_time}s
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeResult && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Feature importance chart */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-slate-800">
                      Top Features — {METHOD_INFO[activeResult.method]?.label || activeResult.method}
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                        <YAxis
                          dataKey="feature"
                          type="category"
                          tick={{ fill: "#64748b", fontSize: 10 }}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            color: "#334155",
                          }}
                          formatter={(value: number, _name: string, props: { payload: { fullName: string } }) => [
                            value.toFixed(4),
                            props.payload.fullName,
                          ]}
                        />
                        <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                          {chartData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={
                                i === 0
                                  ? "#22c55e"
                                  : METHOD_INFO[activeResult.method]?.color || "#3b82f6"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Selected features list & metrics */}
                  <div className="space-y-4">
                    {/* Metrics */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 text-sm font-bold text-slate-800">
                        Model Performance (with selected features)
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(activeResult.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              {key.replace("_", " ")}
                            </div>
                            <div className="mt-1 font-mono text-lg font-bold text-slate-800">
                              {typeof value === "number" ? value.toFixed(4) : value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feature list */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 text-sm font-bold text-slate-800">
                        Selected Features ({activeResult.selected_features.length})
                      </h3>
                      <div className="max-h-[300px] space-y-1 overflow-y-auto">
                        {activeResult.importances.map((imp, i) => (
                          <div
                            key={imp.feature}
                            className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${
                              i === 0 ? "bg-emerald-50" : i % 2 === 0 ? "bg-slate-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-6 font-mono text-xs text-slate-400">
                                {imp.rank}
                              </span>
                              <span className="text-slate-700">{imp.feature}</span>
                            </div>
                            <span className="font-mono text-xs text-slate-500">
                              {imp.importance.toFixed(4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!response && !loading && !error && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <BarChart3 size={40} className="mx-auto mb-3 text-slate-400" />
              <p className="text-sm text-slate-500">
                Select a dataset and run feature selection to identify the most predictive variables
              </p>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
