/**
 * Patient Forecast page — 7-day forecast with confidence intervals.
 *
 * === TRIANGULATION RECORD ===
 * Vertex 1: Hyndman (2021) Ch.5 — Forecast visualization with prediction intervals
 * Vertex 2: Kaggle time series forecasting notebooks — line + area for intervals
 * Vertex 3: pages/10_Patient_Forecast.py, api/routes/forecast.py
 * Verdict: PROCEED
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, AlertCircle, ArrowRight, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { getMe, listDatasets, getModelComparison, generateForecast, type DatasetInfo, type ForecastResponse } from "@/lib/api";

export default function ForecastPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [modelId, setModelId] = useState("");
  const [models, setModels] = useState<{ model_id: string; model_type: string; metrics: { rmse: number } }[]>([]);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    getModelComparison(selectedId).then((c) => {
      setModels(c.models);
      if (c.models.length > 0) setModelId(c.models[0].model_id);
    }).catch(() => {});
  }, [selectedId]);

  const handleForecast = async () => {
    if (!selectedId || !modelId) return;
    setLoading(true);
    setError("");
    try {
      const result = await generateForecast({ dataset_id: selectedId, model_id: modelId });
      setForecast(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Forecast failed");
    } finally {
      setLoading(false);
    }
  };

  const chartData = forecast?.predictions.map((p) => ({
    day: `Day ${p.horizon}`,
    forecast: Math.round(p.forecast),
    lower: p.lower ? Math.round(p.lower) : undefined,
    upper: p.upper ? Math.round(p.upper) : undefined,
  })) || [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Patient Forecast</h1>
            <p className="mt-1 text-sm text-slate-400">7-day ED arrival predictions with confidence intervals</p>
          </div>
          <button onClick={() => router.push("/staff")} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:border-white/[0.15]">
            Staff Planner <ArrowRight size={14} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none">
            <option value="">— Dataset —</option>
            {datasets.map((d) => <option key={d.dataset_id} value={d.dataset_id}>{(d.metadata as Record<string, string>)?.type} · {d.dataset_id.slice(0, 8)}…</option>)}
          </select>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)} className="rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none">
            <option value="">— Model —</option>
            {models.map((m) => <option key={m.model_id} value={m.model_id}>{m.model_type} (RMSE: {m.metrics.rmse.toFixed(2)})</option>)}
          </select>
          <button onClick={handleForecast} disabled={!selectedId || !modelId || loading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <TrendingUp size={16} />}
            Generate Forecast
          </button>
        </div>

        {error && <div className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400"><AlertCircle size={16} /> {error}</div>}

        {forecast && (
          <>
            {/* Forecast chart */}
            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5">
              <h3 className="mb-4 text-sm font-bold text-white">7-Day Forecast — {forecast.model_name}</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }} />
                  {chartData[0]?.lower !== undefined && <Area type="monotone" dataKey="upper" stroke="none" fill="#3b82f6" fillOpacity={0.1} />}
                  {chartData[0]?.lower !== undefined && <Area type="monotone" dataKey="lower" stroke="none" fill="#020617" fillOpacity={1} />}
                  <Line type="monotone" dataKey="forecast" stroke="#22d3ee" strokeWidth={3} dot={{ fill: "#22d3ee", r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Prediction table */}
            <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-slate-800/50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-400">Horizon</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">Forecast</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">Lower</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">Upper</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.predictions.map((p) => (
                    <tr key={p.horizon} className="border-b border-white/[0.04] hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 text-white"><Calendar size={14} className="mr-2 inline text-slate-500" />Day {p.horizon}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-cyan-400">{Math.round(p.forecast)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">{p.lower != null ? Math.round(p.lower) : "—"}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-400">{p.upper != null ? Math.round(p.upper) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!forecast && !loading && !error && (
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-12 text-center">
            <TrendingUp size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-500">Select a dataset and model, then generate a forecast</p>
          </div>
        )}
      </div>
    </div>
  );
}
