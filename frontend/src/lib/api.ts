/**
 * API client for HealthForecast AI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hf_token");
}

export function setToken(token: string) {
  localStorage.setItem("hf_token", token);
}

export function clearToken() {
  localStorage.removeItem("hf_token");
}

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  name: string;
  role: string;
}

export interface UserInfo {
  username: string;
  name: string;
  role: string;
  email: string | null;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function getMe(): Promise<UserInfo> {
  return apiFetch<UserInfo>("/api/auth/me");
}

export function logout() {
  clearToken();
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
export interface UploadResponse {
  filename: string;
  rows: number;
  columns: string[];
  preview: Record<string, unknown>[];
  dataset_id: string;
}

export async function uploadDataset(
  file: File,
  datasetType: string = "patient"
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("dataset_type", datasetType);
  return apiFetch<UploadResponse>("/api/data/upload", {
    method: "POST",
    body: form,
  });
}

export interface DatasetInfo {
  dataset_id: string;
  rows: number;
  columns: string[];
  created_at: string;
  metadata: Record<string, unknown>;
}

export async function listDatasets(): Promise<DatasetInfo[]> {
  return apiFetch<DatasetInfo[]>("/api/data/datasets");
}

export async function getDataset(
  datasetId: string,
  rows: number = 20
): Promise<Record<string, unknown>> {
  return apiFetch(`/api/data/datasets/${datasetId}?rows=${rows}`);
}

// ---------------------------------------------------------------------------
// KPI
// ---------------------------------------------------------------------------
export interface DashboardKPIs {
  today_forecast: number;
  week_total_forecast: number;
  peak_day_forecast: number;
  peak_day_name: string;
  forecast_model_name: string;
  forecast_dates: string[];
  historical_avg_ed: number;
  historical_max_ed: number;
  historical_min_ed: number;
  total_records: number;
  best_model_name: string;
  best_model_mape: number;
  best_model_rmse: number;
  models_trained: number;
  category_distribution: Record<string, unknown>[];
  staff_coverage_pct: number;
  total_staff_needed: number;
  overtime_hours: number;
  daily_staff_cost: number;
  supply_service_level: number;
  supply_total_cost: number;
  supply_weekly_savings: number;
  supply_items_count: number;
  supply_reorder_alerts: number;
  forecast_trend: Record<string, unknown>[];
  daily_ed_pattern: { day: string; avg_ed: number }[];
  model_comparison: Record<string, unknown>[];
  has_forecast: boolean;
  has_historical: boolean;
  has_models: boolean;
  has_staff_plan: boolean;
  has_supply_plan: boolean;
}

export async function getDashboardKPIs(
  datasetId: string
): Promise<DashboardKPIs> {
  return apiFetch<DashboardKPIs>(`/api/kpi/dashboard/${datasetId}`);
}

// ---------------------------------------------------------------------------
// Fusion
// ---------------------------------------------------------------------------
export interface FuseRequest {
  patient_dataset_id: string;
  weather_dataset_id?: string | null;
  calendar_dataset_id?: string | null;
  reason_dataset_id?: string | null;
}

export interface FuseResponse {
  dataset_id: string;
  rows: number;
  columns: string[];
  processing_report: Record<string, unknown>;
}

export async function fuseDatasets(body: FuseRequest): Promise<FuseResponse> {
  return apiFetch<FuseResponse>("/api/data/fuse", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
export interface ValidateRequest {
  dataset_id: string;
  required_columns?: string[];
  date_column?: string | null;
}

export interface ValidateResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
  detected_date_column: string | null;
  row_count: number;
  column_count: number;
}

export async function validateDataset(
  body: ValidateRequest
): Promise<ValidateResponse> {
  return apiFetch<ValidateResponse>("/api/data/validate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Feature Engineering
// ---------------------------------------------------------------------------
export interface FeatureEngineeringRequest {
  dataset_id: string;
  n_lags?: number;
  n_horizons?: number;
  variant?: string;
  train_ratio?: number;
  cal_ratio?: number;
}

export interface FeatureEngineeringResponse {
  dataset_id: string;
  feature_names: string[];
  target_names: string[];
  train_size: number;
  cal_size: number;
  test_size: number;
  total_features: number;
}

export async function engineerFeatures(
  body: FeatureEngineeringRequest
): Promise<FeatureEngineeringResponse> {
  return apiFetch<FeatureEngineeringResponse>("/api/data/features/engineer", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// EDA (Exploratory Data Analysis)
// ---------------------------------------------------------------------------
export interface ColumnSummary {
  name: string;
  dtype: string;
  non_null: number;
  null_count: number;
  null_pct: number;
  unique: number;
  mean?: number | null;
  std?: number | null;
  min?: number | null;
  max?: number | null;
}

export interface EDAResponse {
  dataset_id: string;
  rows: number;
  columns: number;
  column_summaries: ColumnSummary[];
  correlations: Record<string, number>;
  missing_by_column: Record<string, number>;
  target_stats: Record<string, number>;
  dow_averages: Record<string, number>;
  monthly_averages: Record<string, number>;
  numeric_columns: string[];
  date_column: string | null;
}

export async function exploreDataset(
  datasetId: string,
  targetColumn: string = "ED"
): Promise<EDAResponse> {
  return apiFetch<EDAResponse>("/api/data/explore", {
    method: "POST",
    body: JSON.stringify({
      dataset_id: datasetId,
      target_column: targetColumn,
    }),
  });
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
export async function healthCheck(): Promise<{
  status: string;
  app: string;
  version: string;
}> {
  return apiFetch("/health");
}
