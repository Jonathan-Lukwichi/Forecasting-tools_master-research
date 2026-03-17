/**
 * Upload page — drag-and-drop file upload with dataset preview.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRight,
  CloudUpload,
} from "lucide-react";
import {
  getMe,
  uploadDataset,
  listDatasets,
  type UploadResponse,
  type DatasetInfo,
  type UserInfo,
} from "@/lib/api";

type DatasetType = "patient" | "weather" | "calendar" | "reason";

const DATASET_TYPES: { value: DatasetType; label: string; description: string; icon: string }[] = [
  { value: "patient", label: "Patient Data", description: "Daily ED arrival counts", icon: "🏥" },
  { value: "weather", label: "Weather Data", description: "Temperature, wind, precipitation", icon: "🌤️" },
  { value: "calendar", label: "Calendar Data", description: "Holidays and events", icon: "📅" },
  { value: "reason", label: "Reason Data", description: "Clinical reason codes", icon: "🩺" },
];

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [selectedType, setSelectedType] = useState<DatasetType>("patient");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState("");
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);

  // Auth check + load existing datasets
  useEffect(() => {
    async function init() {
      try {
        const me = await getMe();
        setUser(me);
        const ds = await listDatasets();
        setDatasets(ds);
      } catch {
        router.push("/login");
      }
    }
    init();
  }, [router]);

  // File upload handler
  const handleUpload = useCallback(
    async (file: File) => {
      setError("");
      setUploadResult(null);
      setUploading(true);

      try {
        const result = await uploadDataset(file, selectedType);
        setUploadResult(result);

        // Refresh dataset list
        const ds = await listDatasets();
        setDatasets(ds);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [selectedType]
  );

  // Drag & drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Upload Data</h1>
            <p className="mt-1 text-sm text-slate-400">
              Upload CSV, Excel, or Parquet files to start forecasting
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/[0.15]"
          >
            Dashboard <ArrowRight size={14} />
          </button>
        </div>

        {/* Dataset type selector */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DATASET_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedType === type.value
                  ? "border-cyan-400/40 bg-cyan-400/5"
                  : "border-white/[0.06] bg-slate-900/60 hover:border-white/[0.12]"
              }`}
            >
              <span className="text-lg">{type.icon}</span>
              <div className="mt-1 text-sm font-semibold text-white">
                {type.label}
              </div>
              <div className="text-[11px] text-slate-500">
                {type.description}
              </div>
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${
            dragOver
              ? "border-cyan-400 bg-cyan-400/5"
              : "border-white/[0.1] bg-slate-900/40 hover:border-white/[0.2]"
          } ${uploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls,.parquet"
            onChange={onFileSelect}
            className="hidden"
          />

          {uploading ? (
            <>
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <p className="text-sm text-slate-400">Uploading…</p>
            </>
          ) : (
            <>
              <CloudUpload
                size={40}
                className={`mb-3 ${dragOver ? "text-cyan-400" : "text-slate-600"}`}
              />
              <p className="text-sm font-medium text-slate-300">
                Drag & drop your file here
              </p>
              <p className="mt-1 text-xs text-slate-500">
                or click to browse — CSV, Excel, Parquet
              </p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Upload result */}
        {uploadResult && (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={18} />
              <span className="font-semibold">Upload successful</span>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">File</span>
                <div className="font-medium text-white">{uploadResult.filename}</div>
              </div>
              <div>
                <span className="text-slate-500">Rows</span>
                <div className="font-mono font-medium text-white">
                  {uploadResult.rows.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Columns</span>
                <div className="font-mono font-medium text-white">
                  {uploadResult.columns.length}
                </div>
              </div>
            </div>

            {/* Column list */}
            <div className="mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Columns detected
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {uploadResult.columns.map((col) => (
                  <span
                    key={col}
                    className="rounded-md border border-white/[0.06] bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-slate-800/50">
                    {uploadResult.columns.map((col) => (
                      <th
                        key={col}
                        className="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-400"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadResult.preview.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/[0.04] hover:bg-slate-800/30"
                    >
                      {uploadResult.columns.map((col) => (
                        <td key={col} className="whitespace-nowrap px-3 py-1.5 text-slate-300">
                          {String(row[col] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Go to Dashboard <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setUploadResult(null)}
                className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-slate-400 hover:border-white/[0.15]"
              >
                Upload another
              </button>
            </div>
          </div>
        )}

        {/* Existing datasets */}
        {datasets.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold text-white">
              Uploaded Datasets
            </h2>
            <div className="space-y-2">
              {datasets.map((ds) => (
                <div
                  key={ds.dataset_id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-slate-900/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={18} className="text-slate-500" />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {(ds.metadata?.type as string) || "dataset"}{" "}
                        <span className="text-slate-500">·</span>{" "}
                        <span className="font-mono text-xs text-slate-400">
                          {ds.dataset_id.slice(0, 8)}…
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {ds.rows.toLocaleString()} rows · {ds.columns.length} columns
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600">
                    {new Date(ds.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        <div className="rounded-xl border border-white/[0.06] bg-slate-900/40 p-4">
          <h3 className="mb-2 text-sm font-bold text-white">
            Expected data format
          </h3>
          <div className="grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-300">Patient data</span>
              <p>Must include a date column and ED patient count. Example columns: Date, ED, Reason</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Weather data</span>
              <p>Date + weather metrics: Average_Temp, Max_wind, Total_precipitation</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Calendar data</span>
              <p>Date + holiday flags: is_holiday, holiday_name, school_term</p>
            </div>
            <div>
              <span className="font-semibold text-slate-300">Supported formats</span>
              <p>CSV (.csv), Excel (.xlsx, .xls), Parquet (.parquet)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
