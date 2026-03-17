/**
 * Prepare Data page — select datasets, fuse, and engineer features.
 *
 * === TRIANGULATION RECORD ===
 * Task: Data preparation UI for dataset fusion and feature engineering
 * Approach: Step-by-step wizard (select → fuse → engineer) matching Streamlit 03_Prepare_Data.py
 *
 * Vertex 1 (Academic):
 *   Source: Hyndman & Athanasopoulos (2021). "Forecasting: Principles and Practice", Ch.2-3.
 *   Finding: Data preparation must include temporal alignment, lag features, and train/test split
 *   Relevance: Our fusion + feature engineering follows this standard time series workflow
 *
 * Vertex 2 (Industry):
 *   Source: https://www.kaggle.com/code/anshuls235/time-series-forecasting-eda-fe-modelling
 *   Pattern: Upload → merge → lag features → split → EDA. Sequential pipeline.
 *   Adaptation: Same steps, exposed via REST API instead of inline notebook
 *
 * Vertex 3 (Internal):
 *   Files checked: pages/03_Prepare_Data.py, api/routes/data.py, frontend/src/app/upload/page.tsx
 *   Consistency: Confirmed — API endpoints exist for fuse + engineer, UI matches upload page style
 *
 * Verdict: PROCEED
 * =============================
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Merge,
  Cog,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Layers,
  FlaskConical,
} from "lucide-react";
import {
  getMe,
  listDatasets,
  fuseDatasets,
  engineerFeatures,
  getDataset,
  type DatasetInfo,
  type FuseResponse,
  type FeatureEngineeringResponse,
} from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

export default function PreparePage() {
  const router = useRouter();

  // Auth
  useEffect(() => {
    getMe().catch(() => router.push("/login"));
  }, [router]);

  // Datasets
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [patientId, setPatientId] = useState("");
  const [weatherId, setWeatherId] = useState("");
  const [calendarId, setCalendarId] = useState("");
  const [reasonId, setReasonId] = useState("");

  // Fusion
  const [fusing, setFusing] = useState(false);
  const [fuseResult, setFuseResult] = useState<FuseResponse | null>(null);
  const [fuseError, setFuseError] = useState("");

  // Feature engineering
  const [engineering, setEngineering] = useState(false);
  const [feResult, setFeResult] = useState<FeatureEngineeringResponse | null>(null);
  const [feError, setFeError] = useState("");
  const [nLags, setNLags] = useState(7);
  const [nHorizons, setNHorizons] = useState(7);
  const [trainRatio, setTrainRatio] = useState(0.7);

  // Preview
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null);
  const [previewCols, setPreviewCols] = useState<string[]>([]);

  useEffect(() => {
    listDatasets()
      .then(setDatasets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byType = (type: string) =>
    datasets.filter((d) => (d.metadata as Record<string, string>)?.type === type);

  // Fuse handler
  const handleFuse = useCallback(async () => {
    if (!patientId) return;
    setFusing(true);
    setFuseError("");
    setFuseResult(null);
    setFeResult(null);
    setPreview(null);

    try {
      const result = await fuseDatasets({
        patient_dataset_id: patientId,
        weather_dataset_id: weatherId || null,
        calendar_dataset_id: calendarId || null,
        reason_dataset_id: reasonId || null,
      });
      setFuseResult(result);

      // Load preview
      const ds = await getDataset(result.dataset_id, 10);
      const data = ds as Record<string, unknown>;
      setPreview(data.preview as Record<string, unknown>[]);
      setPreviewCols(data.columns as string[]);

      // Refresh datasets
      const updated = await listDatasets();
      setDatasets(updated);
    } catch (err) {
      setFuseError(err instanceof Error ? err.message : "Fusion failed");
    } finally {
      setFusing(false);
    }
  }, [patientId, weatherId, calendarId, reasonId]);

  // Feature engineering handler
  const handleEngineer = useCallback(async () => {
    if (!fuseResult) return;
    setEngineering(true);
    setFeError("");

    try {
      const result = await engineerFeatures({
        dataset_id: fuseResult.dataset_id,
        n_lags: nLags,
        n_horizons: nHorizons,
        train_ratio: trainRatio,
        cal_ratio: 0.15,
      });
      setFeResult(result);
    } catch (err) {
      setFeError(err instanceof Error ? err.message : "Feature engineering failed");
    } finally {
      setEngineering(false);
    }
  }, [fuseResult, nLags, nHorizons, trainRatio]);

  const SelectBox = ({
    label,
    icon,
    type,
    value,
    onChange,
  }: {
    label: string;
    icon: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
  }) => {
    const options = byType(type);
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-500">
          {icon} {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
        >
          <option value="">— Select —</option>
          {options.map((d) => (
            <option key={d.dataset_id} value={d.dataset_id}>
              {d.dataset_id.slice(0, 8)}… ({d.rows} rows, {d.columns.length} cols)
            </option>
          ))}
        </select>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <PageHeader
          title="Prepare Data"
          description="Fuse and validate your datasets for accurate forecasting"
          icon={Layers}
          badge="Step 2"
          accentColor="sky"
          images={["/images/prepare-bg.jpg"]}
        />

        <FadeIn delay={0.15}>
        {/* Step 1: Select datasets */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Database size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Step 1 — Select Datasets</h2>
          </div>

          {datasets.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">No datasets uploaded yet.</p>
              <button
                onClick={() => router.push("/upload")}
                className="mt-3 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Upload Data
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectBox label="Patient Data (required)" icon="🏥" type="patient" value={patientId} onChange={setPatientId} />
              <SelectBox label="Weather Data (optional)" icon="🌤️" type="weather" value={weatherId} onChange={setWeatherId} />
              <SelectBox label="Calendar Data (optional)" icon="📅" type="calendar" value={calendarId} onChange={setCalendarId} />
              <SelectBox label="Reason Data (optional)" icon="🩺" type="reason" value={reasonId} onChange={setReasonId} />
            </div>
          )}

          <button
            onClick={handleFuse}
            disabled={!patientId || fusing}
            className="mt-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {fusing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Fusing…
              </>
            ) : (
              <>
                <Merge size={16} /> Fuse Datasets
              </>
            )}
          </button>
        </div>

        {/* Fuse error */}
        {fuseError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            <AlertCircle size={16} /> {fuseError}
          </div>
        )}

        {/* Fuse result */}
        {fuseResult && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-500">
              <CheckCircle2 size={18} />
              <span className="font-semibold">Fusion successful</span>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Dataset ID</span>
                <div className="font-mono text-xs text-slate-800">{fuseResult.dataset_id.slice(0, 12)}…</div>
              </div>
              <div>
                <span className="text-slate-500">Rows</span>
                <div className="font-mono font-medium text-slate-800">{fuseResult.rows.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-slate-500">Columns</span>
                <div className="font-mono font-medium text-slate-800">{fuseResult.columns.length}</div>
              </div>
            </div>

            {/* Columns */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {fuseResult.columns.map((col) => (
                <span key={col} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                  {col}
                </span>
              ))}
            </div>

            {/* Preview table */}
            {preview && previewCols.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {previewCols.map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-500">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        {previewCols.map((col) => (
                          <td key={col} className="whitespace-nowrap px-3 py-1.5 text-slate-600">
                            {String(row[col] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Feature Engineering */}
        {fuseResult && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <FlaskConical size={18} className="text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800">Step 2 — Feature Engineering</h2>
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Lag Features (days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={nLags}
                  onChange={(e) => setNLags(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">Creates ED_1…ED_{nLags}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Forecast Horizons</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={nHorizons}
                  onChange={(e) => setNHorizons(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">Creates Target_1…Target_{nHorizons}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">Train Ratio</label>
                <input
                  type="number"
                  min={0.5}
                  max={0.9}
                  step={0.05}
                  value={trainRatio}
                  onChange={(e) => setTrainRatio(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-400">Cal: 15% · Test: {((1 - trainRatio - 0.15) * 100).toFixed(0)}%</p>
              </div>
            </div>

            <button
              onClick={handleEngineer}
              disabled={engineering}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {engineering ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing…
                </>
              ) : (
                <>
                  <Cog size={16} /> Engineer Features
                </>
              )}
            </button>

            {feError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                <AlertCircle size={16} /> {feError}
              </div>
            )}
          </div>
        )}

        {/* Feature engineering result */}
        {feResult && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-500">
              <Layers size={18} />
              <span className="font-semibold">Features engineered</span>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <span className="text-slate-500">Features</span>
                <div className="font-mono font-medium text-slate-800">{feResult.total_features}</div>
              </div>
              <div>
                <span className="text-slate-500">Train</span>
                <div className="font-mono font-medium text-slate-800">{feResult.train_size.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-slate-500">Calibration</span>
                <div className="font-mono font-medium text-slate-800">{feResult.cal_size.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-slate-500">Test</span>
                <div className="font-mono font-medium text-slate-800">{feResult.test_size.toLocaleString()}</div>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Feature columns</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {feResult.feature_names.slice(0, 30).map((f) => (
                  <span key={f} className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                    {f}
                  </span>
                ))}
                {feResult.feature_names.length > 30 && (
                  <span className="text-xs text-slate-500">+{feResult.feature_names.length - 30} more</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target columns</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {feResult.target_names.map((t) => (
                  <span key={t} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push("/explore")}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Explore Data <ArrowRight size={14} />
            </button>
          </div>
        )}
        </FadeIn>
      </div>
    </div>
  );
}
