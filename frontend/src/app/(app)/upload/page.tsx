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
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

type DatasetType = "patient" | "weather" | "calendar" | "reason";

const DATASET_TYPES: { value: DatasetType; label: string; description: string; icon: string }[] = [
  { value: "patient", label: "Patient Data", description: "Daily patient arrival counts", icon: "🏥" },
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <PageHeader
          title="Upload Data"
          description="Import patient records, weather data, and calendar datasets for analysis"
          icon={Upload}
          badge="Step 1"
          accentColor="blue"
          images={["/images/login-bg1.jpg"]}
        />

        <FadeIn delay={0.15}>
        {/* Dataset type selector */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DATASET_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedType === type.value
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="text-lg">{type.icon}</span>
              <div className="mt-1 text-sm font-semibold text-slate-800">
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
          className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30"
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
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm text-slate-500">Uploading…</p>
            </>
          ) : (
            <>
              <CloudUpload
                size={40}
                className={`mb-3 ${dragOver ? "text-blue-600" : "text-slate-400"}`}
              />
              <p className="text-sm font-medium text-slate-700">
                Drag & drop your file here
              </p>
              <p className="mt-1 text-xs text-slate-500">
                or click to browse — CSV, Excel, Parquet
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="rounded-md bg-blue-50 border border-blue-200 px-2.5 py-1 text-[10px] font-bold text-blue-600">CSV</span>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-600">EXCEL</span>
                <span className="rounded-md bg-violet-50 border border-violet-200 px-2.5 py-1 text-[10px] font-bold text-violet-600">PARQUET</span>
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Upload result */}
        {uploadResult && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="mb-3 flex items-center gap-2 text-emerald-500">
              <CheckCircle2 size={18} />
              <span className="font-semibold">Upload successful</span>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">File</span>
                <div className="font-medium text-slate-800">{uploadResult.filename}</div>
              </div>
              <div>
                <span className="text-slate-500">Rows</span>
                <div className="font-mono font-medium text-slate-800">
                  {uploadResult.rows.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Columns</span>
                <div className="font-mono font-medium text-slate-800">
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
                    className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {uploadResult.columns.map((col) => (
                      <th
                        key={col}
                        className="whitespace-nowrap px-3 py-2 text-left font-semibold text-slate-500"
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
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      {uploadResult.columns.map((col) => (
                        <td key={col} className="whitespace-nowrap px-3 py-1.5 text-slate-600">
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
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Go to Dashboard <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setUploadResult(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:border-slate-300"
              >
                Upload another
              </button>
            </div>
          </div>
        )}

        {/* Existing datasets */}
        {datasets.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold text-slate-800">
              Uploaded Datasets
            </h2>
            <div className="space-y-2">
              {datasets.map((ds) => (
                <div
                  key={ds.dataset_id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={18} className="text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        {(ds.metadata?.type as string) || "dataset"}{" "}
                        <span className="text-slate-400">·</span>{" "}
                        <span className="font-mono text-xs text-slate-500">
                          {ds.dataset_id.slice(0, 8)}…
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {ds.rows.toLocaleString()} rows · {ds.columns.length} columns
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(ds.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-bold text-slate-800">
            Expected data format
          </h3>
          <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-700">Patient data</span>
              <p>Must include a date column and daily patient arrival count. Example columns: Date, ED, Reason</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Weather data</span>
              <p>Date + weather metrics: Average_Temp, Max_wind, Total_precipitation</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Calendar data</span>
              <p>Date + holiday flags: is_holiday, holiday_name, school_term</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Supported formats</span>
              <p>CSV (.csv), Excel (.xlsx, .xls), Parquet (.parquet)</p>
            </div>
          </div>
        </div>
        </FadeIn>
      </div>
    </div>
  );
}
