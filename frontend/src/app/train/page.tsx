/**
 * Train Models page — submit ML and baseline training jobs, monitor progress.
 *
 * === TRIANGULATION RECORD ===
 * Task: ML model training UI with background jobs and progress tracking
 * Approach: Submit jobs to Celery via REST, poll status, display results
 *
 * Vertex 1 (Academic):
 *   Source: Huyen, C. (2022). "Designing Machine Learning Systems", Ch.6-7. O'Reilly.
 *   Finding: Training UI should support model selection, hyperparameter config,
 *            progress monitoring, and results comparison in one workflow.
 *
 * Vertex 2 (Industry):
 *   Source: https://towardsdatascience.com/deploying-ml-models-in-production-with-fastapi-and-celery
 *   Pattern: Submit job → poll status → display results. Progress bar for long tasks.
 *
 * Vertex 3 (Internal):
 *   Files checked: pages/08_Train_Models.py (5 tabs), api/routes/models.py, api/routes/jobs.py
 *   Consistency: Confirmed — jobs endpoint returns progress, results match TrainResponse schema
 *
 * Verdict: PROCEED
 * =============================
 */
"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Cpu,
  BarChart3,
  XCircle,
  Clock,
} from "lucide-react";
import {
  getMe,
  listDatasets,
  submitTrainingJob,
  submitBaselineJob,
  getJobStatus,
  type DatasetInfo,
  type JobStatus,
  type TrainResult,
} from "@/lib/api";

const ML_MODELS = [
  { value: "xgboost", label: "XGBoost", icon: "🌲", desc: "Gradient boosting for tabular data" },
  { value: "lstm", label: "LSTM", icon: "🧠", desc: "Recurrent neural network for sequences" },
  { value: "ann", label: "ANN", icon: "🔮", desc: "Dense feedforward neural network" },
];

const BASELINE_MODELS = [
  { value: "arima", label: "ARIMA", icon: "📈", desc: "AutoRegressive Integrated Moving Average" },
  { value: "sarimax", label: "SARIMAX", icon: "📊", desc: "Seasonal ARIMA with exogenous variables" },
];

type Tab = "ml" | "baseline" | "results";

export default function TrainPage() {
  const router = useRouter();

  // Auth + datasets
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedDataset, setSelectedDataset] = useState("");

  // Tab
  const [tab, setTab] = useState<Tab>("ml");

  // ML config
  const [mlModel, setMlModel] = useState("xgboost");
  const [autoTune, setAutoTune] = useState(false);
  const [nTrials, setNTrials] = useState(50);

  // Baseline config
  const [baselineModel, setBaselineModel] = useState("arima");
  const [autoOrder, setAutoOrder] = useState(true);

  // Jobs
  const [activeJobs, setActiveJobs] = useState<Map<string, JobStatus>>(new Map());
  const [completedResults, setCompletedResults] = useState<TrainResult[]>([]);
  const [error, setError] = useState("");
  const pollingRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  useEffect(() => {
    getMe().catch(() => router.push("/login"));
    listDatasets().then((ds) => {
      setDatasets(ds);
      const fused = ds.find((d) => (d.metadata as Record<string, string>)?.type === "fused");
      if (fused) setSelectedDataset(fused.dataset_id);
    });
    return () => {
      // Cleanup polling intervals
      pollingRef.current.forEach((interval) => clearInterval(interval));
    };
  }, [router]);

  // Poll job status
  const startPolling = useCallback((jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        setActiveJobs((prev) => new Map(prev).set(jobId, status));

        if (status.status === "completed" || status.status === "failed") {
          clearInterval(interval);
          pollingRef.current.delete(jobId);

          if (status.status === "completed" && status.result) {
            setCompletedResults((prev) => [...prev, status.result as TrainResult]);
          }

          // Remove from active after 5 seconds
          setTimeout(() => {
            setActiveJobs((prev) => {
              const next = new Map(prev);
              next.delete(jobId);
              return next;
            });
          }, 5000);
        }
      } catch {
        clearInterval(interval);
        pollingRef.current.delete(jobId);
      }
    }, 1500);

    pollingRef.current.set(jobId, interval);
  }, []);

  // Submit ML training
  const handleTrainML = useCallback(async () => {
    if (!selectedDataset) return;
    setError("");
    try {
      const { job_id } = await submitTrainingJob({
        dataset_id: selectedDataset,
        model_type: mlModel,
        auto_tune: autoTune,
        n_trials: nTrials,
      });
      setActiveJobs((prev) => new Map(prev).set(job_id, { job_id, status: "queued", progress: 0 }));
      startPolling(job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit job");
    }
  }, [selectedDataset, mlModel, autoTune, nTrials, startPolling]);

  // Submit baseline training
  const handleTrainBaseline = useCallback(async () => {
    if (!selectedDataset) return;
    setError("");
    try {
      const { job_id } = await submitBaselineJob({
        dataset_id: selectedDataset,
        model_type: baselineModel,
        auto_order: autoOrder,
      });
      setActiveJobs((prev) => new Map(prev).set(job_id, { job_id, status: "queued", progress: 0 }));
      startPolling(job_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit job");
    }
  }, [selectedDataset, baselineModel, autoOrder, startPolling]);

  const TabBtn = ({ id, label, icon }: { id: Tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
        tab === id ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30" : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Train Models</h1>
            <p className="mt-1 text-sm text-slate-400">Train ML and statistical forecasting models</p>
          </div>
          <button
            onClick={() => router.push("/results")}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-sm text-slate-300 hover:border-white/[0.15]"
          >
            Results <ArrowRight size={14} />
          </button>
        </div>

        {/* Dataset selector */}
        <div className="flex items-center gap-3">
          <Cpu size={16} className="text-slate-500" />
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="rounded-lg border border-white/[0.08] bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
          >
            <option value="">— Select dataset —</option>
            {datasets.map((d) => (
              <option key={d.dataset_id} value={d.dataset_id}>
                {(d.metadata as Record<string, string>)?.type || "dataset"} · {d.dataset_id.slice(0, 8)}… ({d.rows} rows)
              </option>
            ))}
          </select>
        </div>

        {/* Active jobs */}
        {activeJobs.size > 0 && (
          <div className="space-y-2">
            {[...activeJobs.entries()].map(([jobId, job]) => (
              <div key={jobId} className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {job.status === "running" ? (
                      <Loader2 size={16} className="animate-spin text-cyan-400" />
                    ) : job.status === "completed" ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : job.status === "failed" ? (
                      <XCircle size={16} className="text-red-400" />
                    ) : (
                      <Clock size={16} className="text-slate-500" />
                    )}
                    <span className="text-sm font-medium text-white">{job.message || job.status}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-500">{jobId.slice(0, 8)}</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${(job.progress || 0) * 100}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-xs text-slate-500">{Math.round((job.progress || 0) * 100)}%</div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <TabBtn id="ml" label="Machine Learning" icon={<Cpu size={14} />} />
          <TabBtn id="baseline" label="Baseline Models" icon={<BarChart3 size={14} />} />
          <TabBtn id="results" label="Results" icon={<CheckCircle2 size={14} />} />
        </div>

        {/* ML Tab */}
        {tab === "ml" && (
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Select ML Model</h2>
            <div className="mb-4 grid grid-cols-3 gap-3">
              {ML_MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMlModel(m.value)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    mlModel === m.value ? "border-cyan-400/40 bg-cyan-400/5" : "border-white/[0.06] bg-slate-900/60 hover:border-white/[0.12]"
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <div className="mt-1 text-sm font-semibold text-white">{m.label}</div>
                  <div className="text-[11px] text-slate-500">{m.desc}</div>
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={autoTune}
                  onChange={(e) => setAutoTune(e.target.checked)}
                  className="rounded border-white/20 bg-slate-800"
                />
                Auto-tune (Optuna)
              </label>
              {autoTune && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Trials:</label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={nTrials}
                    onChange={(e) => setNTrials(Number(e.target.value))}
                    className="w-20 rounded-lg border border-white/[0.08] bg-slate-900/80 px-2 py-1 text-sm text-white"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleTrainML}
              disabled={!selectedDataset}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play size={16} /> Train {ML_MODELS.find((m) => m.value === mlModel)?.label}
            </button>
          </div>
        )}

        {/* Baseline Tab */}
        {tab === "baseline" && (
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5">
            <h2 className="mb-4 text-sm font-bold text-white">Select Baseline Model</h2>
            <div className="mb-4 grid grid-cols-2 gap-3">
              {BASELINE_MODELS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setBaselineModel(m.value)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    baselineModel === m.value ? "border-cyan-400/40 bg-cyan-400/5" : "border-white/[0.06] bg-slate-900/60 hover:border-white/[0.12]"
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <div className="mt-1 text-sm font-semibold text-white">{m.label}</div>
                  <div className="text-[11px] text-slate-500">{m.desc}</div>
                </button>
              ))}
            </div>

            <label className="mb-4 flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={autoOrder}
                onChange={(e) => setAutoOrder(e.target.checked)}
                className="rounded border-white/20 bg-slate-800"
              />
              Auto-detect order (recommended)
            </label>

            <button
              onClick={handleTrainBaseline}
              disabled={!selectedDataset}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play size={16} /> Train {BASELINE_MODELS.find((m) => m.value === baselineModel)?.label}
            </button>
          </div>
        )}

        {/* Results Tab */}
        {tab === "results" && (
          <div className="space-y-4">
            {completedResults.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 p-12 text-center">
                <BarChart3 size={40} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm text-slate-500">No results yet. Train a model to see results here.</p>
              </div>
            ) : (
              <>
                {/* Comparison table */}
                <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-slate-800/50">
                        <th className="px-4 py-3 text-left font-semibold text-slate-400">Model</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-400">RMSE</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-400">MAE</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-400">MAPE %</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-400">Time (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedResults
                        .sort((a, b) => (a.metrics?.rmse || 999) - (b.metrics?.rmse || 999))
                        .map((r, i) => (
                          <tr
                            key={r.model_id || i}
                            className={`border-b border-white/[0.04] hover:bg-slate-800/30 ${i === 0 ? "bg-emerald-400/5" : ""}`}
                          >
                            <td className="px-4 py-2.5">
                              <div className="font-medium text-white">{r.model_name || r.model_type}</div>
                              <div className="font-mono text-xs text-slate-500">{r.model_id?.slice(0, 8)}</div>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-white">{r.metrics?.rmse?.toFixed(2) ?? "—"}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-white">{r.metrics?.mae?.toFixed(2) ?? "—"}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-white">{r.metrics?.mape?.toFixed(2) ?? "—"}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-400">{r.training_time?.toFixed(1) ?? "—"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Best model highlight */}
                {completedResults.length > 0 && (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle2 size={16} />
                      <span className="font-semibold">
                        Best model: {completedResults.sort((a, b) => (a.metrics?.rmse || 999) - (b.metrics?.rmse || 999))[0]?.model_name}
                      </span>
                      <span className="text-emerald-300/70">
                        (RMSE: {completedResults.sort((a, b) => (a.metrics?.rmse || 999) - (b.metrics?.rmse || 999))[0]?.metrics?.rmse?.toFixed(2)})
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
