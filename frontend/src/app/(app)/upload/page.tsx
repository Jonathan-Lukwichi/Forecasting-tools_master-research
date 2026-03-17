/**
 * Upload page — file upload or load from Supabase database.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CloudUpload,
  Database,
  Loader2,
} from "lucide-react";
import {
  getMe,
  uploadDataset,
  listDatasets,
  getSupabaseTables,
  loadSupabaseTables,
  type UploadResponse,
  type DatasetInfo,
  type UserInfo,
  type SupabaseTableInfo,
  type SupabaseLoadResponse,
} from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import FadeIn from "@/components/ui/FadeIn";

type DatasetType = "patient" | "weather" | "calendar" | "reason";
type SourceTab = "file" | "database";

const DATASET_TYPES: { value: DatasetType; label: string; description: string; icon: string }[] = [
  { value: "patient", label: "Patient Data", description: "Daily patient arrival counts", icon: "🏥" },
  { value: "weather", label: "Weather Data", description: "Temperature, wind, precipitation", icon: "🌤️" },
  { value: "calendar", label: "Calendar Data", description: "Holidays and events", icon: "📅" },
  { value: "reason", label: "Reason Data", description: "Clinical reason codes", icon: "🩺" },
];

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sourceTab, setSourceTab] = useState<SourceTab>("database");
  const [selectedType, setSelectedType] = useState<DatasetType>("patient");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState("");
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);

  // Supabase state
  const [supabaseTables, setSupabaseTables] = useState<SupabaseTableInfo[]>([]);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [loadingDb, setLoadingDb] = useState(false);
  const [loadingTables, setLoadingTables] = useState(true);
  const [dbResults, setDbResults] = useState<SupabaseLoadResponse[]>([]);
  const [dbErrors, setDbErrors] = useState<string[]>([]);

  // Auth check + load existing datasets + supabase tables
  useEffect(() => {
    async function init() {
      try {
        const me = await getMe();
        setUser(me);
        const ds = await listDatasets();
        setDatasets(ds);
      } catch {
        router.push("/login");
        return;
      }

      // Fetch supabase tables (non-blocking)
      try {
        const res = await getSupabaseTables();
        setSupabaseConnected(res.connected);
        setSupabaseTables(res.tables);
      } catch {
        setSupabaseConnected(false);
      } finally {
        setLoadingTables(false);
      }
    }
    init();
  }, [router]);

  // Toggle table selection
  const toggleTable = useCallback((tableName: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableName)) {
        next.delete(tableName);
      } else {
        next.add(tableName);
      }
      return next;
    });
  }, []);

  // Select all tables
  const selectAllTables = useCallback(() => {
    const available = supabaseTables.filter((t) => t.available && t.row_count > 0);
    setSelectedTables(new Set(available.map((t) => t.table_name)));
  }, [supabaseTables]);

  // Load selected tables from Supabase
  const handleLoadFromDb = useCallback(async () => {
    if (selectedTables.size === 0) return;

    setError("");
    setDbResults([]);
    setDbErrors([]);
    setLoadingDb(true);

    try {
      const res = await loadSupabaseTables(Array.from(selectedTables));
      setDbResults(res.datasets);
      setDbErrors(res.errors);

      // Refresh dataset list
      const ds = await listDatasets();
      setDatasets(ds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load from database");
    } finally {
      setLoadingDb(false);
    }
  }, [selectedTables]);

  // File upload handler
  const handleUpload = useCallback(
    async (file: File) => {
      setError("");
      setUploadResult(null);
      setUploading(true);

      try {
        const result = await uploadDataset(file, selectedType);
        setUploadResult(result);
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
          description="Load datasets from the database or import files for analysis"
          icon={Upload}
          badge="Step 1"
          accentColor="blue"
          images={["/images/login-bg1.jpg"]}
        />

        <FadeIn delay={0.15}>
        {/* Source tab switcher */}
        <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
          <button
            onClick={() => setSourceTab("database")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              sourceTab === "database"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <Database size={16} />
            Load from Database
          </button>
          <button
            onClick={() => setSourceTab("file")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              sourceTab === "file"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <CloudUpload size={16} />
            Upload File
          </button>
        </div>

        {/* =============== DATABASE TAB =============== */}
        {sourceTab === "database" && (
          <div className="space-y-4">
            {/* Connection status */}
            <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium ${
              loadingTables
                ? "border-amber-200 bg-amber-50 text-amber-600"
                : supabaseConnected
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-red-200 bg-red-50 text-red-600"
            }`}>
              {loadingTables ? (
                <><Loader2 size={14} className="animate-spin" /> Connecting to database...</>
              ) : supabaseConnected ? (
                <><div className="h-2 w-2 rounded-full bg-emerald-500" /> Connected to Supabase</>
              ) : (
                <><AlertCircle size={14} /> Database not configured — set SUPABASE_URL and SUPABASE_KEY in .env</>
              )}
            </div>

            {/* Table picker */}
            {supabaseConnected && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800">
                    Select datasets to load
                  </h2>
                  <button
                    onClick={selectAllTables}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Select all
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {supabaseTables.map((table) => {
                    const isSelected = selectedTables.has(table.table_name);
                    const isEmpty = table.row_count === 0;

                    return (
                      <button
                        key={table.table_name}
                        onClick={() => !isEmpty && toggleTable(table.table_name)}
                        disabled={isEmpty || loadingDb}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                          isEmpty
                            ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                            : isSelected
                            ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300"
                        }`}>
                          {isSelected && (
                            <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">
                              {table.label}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                              {table.row_count.toLocaleString()} rows
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {table.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Load button */}
                <button
                  onClick={handleLoadFromDb}
                  disabled={selectedTables.size === 0 || loadingDb}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                >
                  {loadingDb ? (
                    <><Loader2 size={16} className="animate-spin" /> Loading {selectedTables.size} dataset{selectedTables.size !== 1 ? "s" : ""}...</>
                  ) : (
                    <><Database size={16} /> Load {selectedTables.size} dataset{selectedTables.size !== 1 ? "s" : ""} from database</>
                  )}
                </button>
              </>
            )}

            {/* DB load results */}
            {dbResults.length > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="mb-3 flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 size={18} />
                  <span className="font-semibold">
                    {dbResults.length} dataset{dbResults.length !== 1 ? "s" : ""} loaded successfully
                  </span>
                </div>

                <div className="space-y-2">
                  {dbResults.map((res) => (
                    <div
                      key={res.dataset_id}
                      className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <Database size={16} className="text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {res.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {res.rows.toLocaleString()} rows · {res.columns.length} columns
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {res.dataset_type}
                      </span>
                    </div>
                  ))}
                </div>

                {dbErrors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {dbErrors.map((err, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-red-500">
                        <AlertCircle size={12} />
                        {err}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Go to Dashboard <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => { setDbResults([]); setDbErrors([]); setSelectedTables(new Set()); }}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:border-slate-300"
                  >
                    Load more
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =============== FILE UPLOAD TAB =============== */}
        {sourceTab === "file" && (
          <div className="space-y-4">
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
          </div>
        )}

        {/* Error (shared) */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Existing datasets (shared) */}
        {datasets.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold text-slate-800">
              Loaded Datasets
            </h2>
            <div className="space-y-2">
              {datasets.map((ds) => (
                <div
                  key={ds.dataset_id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {(ds.metadata?.source as string) === "supabase" ? (
                      <Database size={18} className="text-blue-500" />
                    ) : (
                      <FileSpreadsheet size={18} className="text-slate-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        {(ds.metadata?.label as string) || (ds.metadata?.type as string) || "dataset"}{" "}
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
        </FadeIn>
      </div>
    </div>
  );
}
