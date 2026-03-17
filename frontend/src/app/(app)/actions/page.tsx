/**
 * Action Center page — AI-powered recommendations for hospital managers.
 *
 * === TRIANGULATION RECORD ===
 * Vertex 1: Huyen (2022) Ch.11 "Designing ML Systems" — ML-powered decision support
 * Vertex 2: https://upstash.com/blog/sse-streaming-llm-responses — LLM response streaming
 * Vertex 3: pages/13_Action_Center.py (4 tabs: staff, supply, combined, export)
 * Verdict: PROCEED
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  Users,
  Package,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  getMe,
  listDatasets,
  getRecommendations,
  type DatasetInfo,
  type Recommendation,
  type RecommendationResponse,
} from "@/lib/api";

const PRIORITY_CONFIG = {
  CRITICAL: { color: "text-red-500", bg: "bg-red-50", border: "border-red-200", icon: ShieldAlert },
  HIGH: { color: "text-red-500", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
  MEDIUM: { color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", icon: Info },
  LOW: { color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", icon: CheckCircle },
};

type Context = "staff" | "supply" | "general";

export default function ActionsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [context, setContext] = useState<Context>("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    getMe().catch(() => router.push("/login"));
    listDatasets().then((ds) => {
      setDatasets(ds);
      const fused = ds.find((d) => (d.metadata as Record<string, string>)?.type === "fused");
      if (fused) setSelectedId(fused.dataset_id);
    });
  }, [router]);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getRecommendations({ dataset_id: selectedId, context });
      setResponse(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  const grouped = response?.recommendations.reduce<Record<string, Recommendation[]>>((acc, r) => {
    (acc[r.priority] ??= []).push(r);
    return acc;
  }, {}) ?? {};

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Action Center</h1>
            <p className="mt-1 text-sm text-slate-500">AI-powered recommendations for hospital resource management</p>
          </div>
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:border-slate-300 hover:bg-slate-50">
            Dashboard
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none">
            <option value="">— Dataset —</option>
            {datasets.map((d) => <option key={d.dataset_id} value={d.dataset_id}>{(d.metadata as Record<string, string>)?.type} · {d.dataset_id.slice(0, 8)}…</option>)}
          </select>

          <div className="flex gap-2">
            {([
              { id: "general" as Context, label: "General", icon: <Sparkles size={14} /> },
              { id: "staff" as Context, label: "Staff", icon: <Users size={14} /> },
              { id: "supply" as Context, label: "Supply", icon: <Package size={14} /> },
            ]).map((c) => (
              <button
                key={c.id}
                onClick={() => setContext(c.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  context === c.id ? "bg-blue-50 text-blue-600 border border-blue-200" : "text-slate-500 hover:text-slate-700 border border-transparent"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={!selectedId || loading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-40">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            Generate Recommendations
          </button>
        </div>

        {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle size={16} /> {error}</div>}

        {/* Recommendations */}
        {response && (
          <>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles size={14} className="text-blue-600" />
              {response.recommendations.length} recommendations · {response.model_used} · {new Date(response.generated_at).toLocaleTimeString()}
            </div>

            {/* Priority groups */}
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((priority) => {
              const items = grouped[priority];
              if (!items?.length) return null;
              const config = PRIORITY_CONFIG[priority];
              const Icon = config.icon;

              return (
                <div key={priority} className="space-y-2">
                  <div className={`flex items-center gap-2 text-sm font-bold ${config.color}`}>
                    <Icon size={16} />
                    {priority} ({items.length})
                  </div>
                  {items.map((rec, i) => (
                    <div key={i} className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`rounded-full ${config.bg} px-2 py-0.5 text-xs font-bold ${config.color}`}>{rec.category}</span>
                      </div>
                      <h3 className="mb-1 text-sm font-bold text-slate-800">{rec.action}</h3>
                      <p className="mb-2 text-sm text-slate-600">{rec.rationale}</p>
                      <div className="text-xs text-slate-500">Expected impact: {rec.impact}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

        {!response && !loading && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Zap size={40} className="mx-auto mb-3 text-slate-400" />
            <p className="text-sm text-slate-500">Select a dataset and context, then generate AI recommendations</p>
            <p className="mt-1 text-xs text-slate-400">Powered by Claude / GPT for contextual hospital management insights</p>
          </div>
        )}
      </div>
    </div>
  );
}
