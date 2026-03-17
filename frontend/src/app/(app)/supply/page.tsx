/**
 * Supply Planner page — MILP inventory optimization.
 *
 * === TRIANGULATION RECORD ===
 * Vertex 1: Hillier & Lieberman (2021) "Intro to OR" Ch.18 — Inventory models
 * Vertex 2: Kaggle supply chain optimization notebooks
 * Vertex 3: pages/12_Supply_Planner.py, api/routes/optimization.py (inventory endpoint)
 * Verdict: PROCEED
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertCircle, ArrowRight, CheckCircle2, DollarSign, Plus, Trash2 } from "lucide-react";
import { getMe, listDatasets, optimizeInventory, type DatasetInfo, type InventoryItem, type InventoryOptimizeResponse } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

const DEFAULT_ITEMS: InventoryItem[] = [
  { item_id: "PPE-001", name: "N95 Masks", category: "PPE", unit_cost: 2.50, stockout_penalty: 1000, lead_time: 3, usage_rate: 0.5, criticality: "CRITICAL" },
  { item_id: "PPE-002", name: "Gloves (box)", category: "PPE", unit_cost: 8.00, stockout_penalty: 500, lead_time: 2, usage_rate: 1.0, criticality: "HIGH" },
  { item_id: "MED-001", name: "Saline IV (1L)", category: "Medications", unit_cost: 3.50, stockout_penalty: 2000, lead_time: 5, usage_rate: 0.3, criticality: "CRITICAL" },
];

export default function SupplyPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [items, setItems] = useState<InventoryItem[]>(DEFAULT_ITEMS);
  const [horizon, setHorizon] = useState(10);
  const [budget, setBudget] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InventoryOptimizeResponse | null>(null);

  useEffect(() => {
    getMe().catch(() => router.push("/login"));
    listDatasets().then((ds) => {
      setDatasets(ds);
      const fused = ds.find((d) => (d.metadata as Record<string, string>)?.type === "fused");
      if (fused) setSelectedId(fused.dataset_id);
    });
  }, [router]);

  const addItem = () => {
    const id = `ITEM-${String(items.length + 1).padStart(3, "0")}`;
    setItems([...items, { item_id: id, name: "", category: "General", unit_cost: 1, criticality: "MEDIUM" }]);
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof InventoryItem, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleOptimize = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError("");
    try {
      const res = await optimizeInventory({
        dataset_id: selectedId,
        items,
        planning_horizon: horizon,
        daily_budget: budget,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader title="Supply Planner" description="Manage inventory levels, prevent stockouts, and reduce waste" icon={Package} badge="Step 8" accentColor="red" />

        <FadeIn delay={0.15}>
        {/* Config */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-800">Configuration</h2>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Dataset</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none">
                <option value="">— Select —</option>
                {datasets.map((d) => <option key={d.dataset_id} value={d.dataset_id}>{(d.metadata as Record<string, string>)?.type} · {d.dataset_id.slice(0, 8)}…</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Planning Horizon (days)</label>
              <input type="number" min={1} max={60} value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Daily Budget ($)</label>
              <input type="number" min={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none" />
            </div>
          </div>

          {/* Items table */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inventory Items</span>
              <button onClick={addItem} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-50">
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Name", "Category", "Unit Cost", "Stockout Pen.", "Lead Time", "Criticality", ""].map((h) => (
                      <th key={h} className="px-2 py-2 text-left font-semibold text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.item_id} className="border-b border-slate-100">
                      <td className="px-2 py-1"><input type="text" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} className="w-28 rounded border border-slate-200 bg-white px-1.5 py-1 text-slate-800" /></td>
                      <td className="px-2 py-1"><input type="text" value={item.category} onChange={(e) => updateItem(i, "category", e.target.value)} className="w-20 rounded border border-slate-200 bg-white px-1.5 py-1 text-slate-800" /></td>
                      <td className="px-2 py-1"><input type="number" value={item.unit_cost} onChange={(e) => updateItem(i, "unit_cost", Number(e.target.value))} className="w-16 rounded border border-slate-200 bg-white px-1.5 py-1 text-slate-800" /></td>
                      <td className="px-2 py-1"><input type="number" value={item.stockout_penalty} onChange={(e) => updateItem(i, "stockout_penalty", Number(e.target.value))} className="w-16 rounded border border-slate-200 bg-white px-1.5 py-1 text-slate-800" /></td>
                      <td className="px-2 py-1"><input type="number" value={item.lead_time} onChange={(e) => updateItem(i, "lead_time", Number(e.target.value))} className="w-12 rounded border border-slate-200 bg-white px-1.5 py-1 text-slate-800" /></td>
                      <td className="px-2 py-1">
                        <select value={item.criticality} onChange={(e) => updateItem(i, "criticality", e.target.value)} className="rounded border border-slate-200 bg-white px-1 py-1 text-slate-800">
                          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1"><button onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button onClick={handleOptimize} disabled={!selectedId || items.length === 0 || loading} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-40">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Package size={16} />}
            Optimize Inventory
          </button>
        </div>

        {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"><AlertCircle size={16} /> {error}</div>}

        {result && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Status", value: result.status, color: result.is_optimal ? "text-emerald-500" : "text-amber-500" },
                { label: "Total Cost", value: `$${result.total_cost.toLocaleString()}`, color: "text-blue-600" },
                { label: "Service Level", value: `${(result.service_level * 100).toFixed(1)}%`, color: "text-blue-500" },
                { label: "Solve Time", value: `${result.solve_time}s`, color: "text-violet-500" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</div>
                  <div className={`mt-1 font-mono text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Cost breakdown */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Ordering Cost", value: result.ordering_cost },
                { label: "Holding Cost", value: result.holding_cost },
                { label: "Stockout Cost", value: result.stockout_cost },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
                  <div className="text-[11px] font-semibold uppercase text-slate-500">{c.label}</div>
                  <div className="mt-1 font-mono text-lg font-bold text-slate-800">${c.value.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Reorder alerts */}
            {result.reorder_alerts.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 text-sm font-bold text-amber-600">Reorder Alerts</h3>
                <div className="space-y-1">
                  {result.reorder_alerts.map((alert, i) => (
                    <div key={i} className="text-sm text-slate-700">
                      <span className="font-medium">{String(alert.item_id || alert.name)}</span>
                      {" — reorder point: "}{String(alert.reorder_point ?? "N/A")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!result && !loading && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Package size={40} className="mx-auto mb-3 text-slate-400" />
            <p className="text-sm text-slate-500">Configure items and run the inventory optimizer</p>
          </div>
        )}
        </FadeIn>
      </div>
    </div>
  );
}
