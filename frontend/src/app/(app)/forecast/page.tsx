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
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

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
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="Patient Forecast"
          description="Generate 7-day predictions with confidence intervals"
          icon={TrendingUp}
          badge="Step 6"
          accentColor="blue"
        />
        <div className="flex justify-end -mt-2">
          <button onClick={() => router.push("/staff")} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50">
            Staff Planner <ArrowRight size={14} />
          </button>
        </div>

        <FadeIn delay={0.15}>
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none">
            <option value="">— Dataset —</option>
            {datasets.map((d) => <option key={d.dataset_id} value={d.dataset_id}>{(d.metadata as Record<string, string>)?.type} · {d.dataset_id.slice(0, 8)}…</option>)}
          </select>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none">
            <option value="">— Model —</option>
            {models.map((m) => <option key={m.model_id} value={m.model_id}>{m.model_type} (RMSE: {m.metrics.rmse.toFixed(2)})</option>)}
          </select>
          <button onClick={handleForecast} disabled={!selectedId || !modelId || loading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <TrendingUp size={16} />}
            Generate Forecast
          </button>
        </div>

        {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500"><AlertCircle size={16} /> {error}</div>}

        {forecast && (
          <>
            {/* Forecast chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">7-Day Forecast — {forecast.model_name}</h3>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#334155" }} />
                  {chartData[0]?.lower !== undefined && <Area type="monotone" dataKey="upper" stroke="none" fill="#3b82f6" fillOpacity={0.1} />}
                  {chartData[0]?.lower !== undefined && <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} />}
                  <Line type="monotone" dataKey="forecast" stroke="#2563eb" strokeWidth={3} dot={{ fill: "#2563eb", r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Prediction table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Horizon</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Forecast</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Lower</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Upper</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.predictions.map((p) => (
                    <tr key={p.horizon} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-800"><Calendar size={14} className="mr-2 inline text-slate-400" />Day {p.horizon}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-blue-600">{Math.round(p.forecast)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-500">{p.lower != null ? Math.round(p.lower) : "—"}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-500">{p.upper != null ? Math.round(p.upper) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!forecast && !loading && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <TrendingUp size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">Select a dataset and model, then generate a forecast</p>
          </div>
        )}
      </div>
    </div>
  );
}
