/**
 * Staff Planner page — MILP staff scheduling optimization.
 *
 * === TRIANGULATION RECORD ===
 * Vertex 1: Hillier & Lieberman (2021) "Intro to Operations Research" Ch.3 — LP/MILP
 * Vertex 2: Ernst et al. (2004) "Staff scheduling and rostering" — EJOR
 * Vertex 3: pages/11_Staff_Planner.py, api/routes/optimization.py (staff endpoint)
 * Verdict: PROCEED
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, AlertCircle, ArrowRight, CheckCircle2, DollarSign, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getMe, listDatasets, optimizeStaff, type DatasetInfo, type StaffOptimizeResponse } from "@/lib/api";

export default function StaffPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [horizon, setHorizon] = useState(10);
  const [minStaff, setMinStaff] = useState(2);
  const [maxOT, setMaxOT] = useState(4);
  const [otMultiplier, setOtMultiplier] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StaffOptimizeResponse | null>(null);

  useEffect(() => {
    getMe().catch(() => router.push("/login"));
    listDatasets().then((ds) => {
      setDatasets(ds);
      const fused = ds.find((d) => (d.metadata as Record<string, string>)?.type === "fused");
      if (fused) setSelectedId(fused.dataset_id);
    });
  }, [router]);

  const handleOptimize = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    try {
      const res = await optimizeStaff({
        dataset_id: selectedId,
        planning_horizon: horizon,
        min_staff_per_shift: minStaff,
        max_overtime_hours: maxOT,
        overtime_multiplier: otMultiplier,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  const dailyData = result?.daily_summary?.map((d: Record<string, unknown>) => ({
    day: String(d.day ?? d.date ?? ""),
    staff: Number(d.total_staff ?? d.staff ?? 0),
    cost: Number(d.total_cost ?? d.cost ?? 0),
  })) || [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Staff Planner</h1>
            <p className="mt-1 text-sm text-slate-400">MILP-optimized staff scheduling</p>
          </div>
          <button onClick={() => router.push("/supply")} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:border-white/[0.15]">
            Supply Planner <ArrowRight size={14} />
          </button>
        </div>

        {/* Config */}
        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5">
          <h2 className="mb-4 text-sm font-bold text-white">Configuration</h2>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Dataset</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none">
                <option value="">— Select —</option>
                {datasets.map((d) => <option key={d.dataset_id} value={d.dataset_id}>{(d.metadata as Record<string, string>)?.type} · {d.dataset_id.slice(0, 8)}…</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Planning Horizon (days)</label>
              <input type="number" min={1} max={30} value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="w-full rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Min Staff / Shift</label>
              <input type="number" min={1} max={20} value={minStaff} onChange={(e) => setMinStaff(Number(e.target.value))} className="w-full rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Max Overtime (hrs)</label>
              <input type="number" min={0} max={12} value={maxOT} onChange={(e) => setMaxOT(Number(e.target.value))} className="w-full rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-cyan-400/40 focus:outline-none" />
            </div>
          </div>
          <button onClick={handleOptimize} disabled={!selectedId || loading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Users size={16} />}
            Optimize Schedule
          </button>
        </div>

        {error && <div className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400"><AlertCircle size={16} /> {error}</div>}

        {result && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Status", value: result.status, icon: <CheckCircle2 size={16} className={result.is_optimal ? "text-emerald-400" : "text-yellow-400"} /> },
                { label: "Total Cost", value: `$${result.total_cost.toLocaleString()}`, icon: <DollarSign size={16} className="text-cyan-400" /> },
                { label: "Solve Time", value: `${result.solve_time}s`, icon: <Clock size={16} className="text-violet-400" /> },
                { label: "Variables", value: result.num_variables.toLocaleString(), icon: <Users size={16} className="text-blue-400" /> },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{kpi.icon}{kpi.label}</div>
                  <div className="mt-1 font-mono text-lg font-bold text-white">{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Cost breakdown */}
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: "Regular Labor", value: result.regular_labor_cost, color: "text-blue-400" },
                { label: "Overtime", value: result.overtime_cost, color: "text-yellow-400" },
                { label: "Understaffing", value: result.understaffing_penalty, color: "text-red-400" },
                { label: "Overstaffing", value: result.overstaffing_penalty, color: "text-orange-400" },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-white/[0.06] bg-slate-800/40 p-3 text-center">
                  <div className="text-[11px] font-semibold uppercase text-slate-500">{c.label}</div>
                  <div className={`mt-1 font-mono text-lg font-bold ${c.color}`}>${c.value.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Daily chart */}
            {dailyData.length > 0 && (
              <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-4">
                <h3 className="mb-3 text-sm font-bold text-white">Daily Staff Allocation</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }} />
                    <Bar dataKey="staff" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {!result && !loading && !error && (
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-12 text-center">
            <Users size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-500">Configure parameters and run the staff scheduling optimizer</p>
          </div>
        )}
      </div>
    </div>
  );
}
