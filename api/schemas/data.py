"""
Data upload, processing, and fusion schemas.
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------
class UploadResponse(BaseModel):
    filename: str
    rows: int
    columns: list[str]
    preview: list[dict[str, Any]]
    dataset_id: str


# ---------------------------------------------------------------------------
# Fetch from Supabase (by hospital)
# ---------------------------------------------------------------------------
class FetchDatasetRequest(BaseModel):
    """Request to fetch a dataset from Supabase filtered by hospital."""
    dataset_type: str  # "patient", "weather", "calendar", "reason"
    hospital_name: str
    start_date: str | None = None  # "YYYY-MM-DD" format
    end_date: str | None = None  # "YYYY-MM-DD" format


class FetchDatasetResponse(BaseModel):
    """Response after fetching a dataset from Supabase."""
    dataset_id: str
    dataset_type: str
    hospital_name: str
    rows: int
    columns: list[str]
    preview: list[dict[str, Any]]


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
class ValidateRequest(BaseModel):
    dataset_id: str
    required_columns: list[str] = []
    date_column: str | None = None


class ValidateResponse(BaseModel):
    valid: bool
    errors: list[str] = []
    warnings: list[str] = []
    detected_date_column: str | None = None
    row_count: int = 0
    column_count: int = 0


# ---------------------------------------------------------------------------
# Fusion
# ---------------------------------------------------------------------------
class FuseRequest(BaseModel):
    patient_dataset_id: str
    weather_dataset_id: str | None = None
    calendar_dataset_id: str | None = None
    reason_dataset_id: str | None = None


class FuseResponse(BaseModel):
    dataset_id: str
    rows: int
    columns: list[str]
    processing_report: dict[str, Any]


# ---------------------------------------------------------------------------
# Feature Engineering
# ---------------------------------------------------------------------------
class FeatureEngineeringRequest(BaseModel):
    dataset_id: str
    n_lags: int = 7
    n_horizons: int = 7
    variant: str = "A"  # "A" = OneHot, "B" = Cyclical
    train_ratio: float = 0.70
    cal_ratio: float = 0.15


class FeatureEngineeringResponse(BaseModel):
    dataset_id: str
    feature_names: list[str]
    target_names: list[str]
    train_size: int
    cal_size: int
    test_size: int
    total_features: int


# ---------------------------------------------------------------------------
# Feature Selection
# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# EDA (Exploratory Data Analysis)
# ---------------------------------------------------------------------------
class EDARequest(BaseModel):
    dataset_id: str
    target_column: str = "ED"
    top_correlations: int = 10


class ColumnSummary(BaseModel):
    name: str
    dtype: str
    non_null: int
    null_count: int
    null_pct: float
    unique: int
    mean: float | None = None
    std: float | None = None
    min: float | None = None
    max: float | None = None


class ACFPACFResult(BaseModel):
    """ACF and PACF values for time series analysis."""
    acf_values: list[float]
    pacf_values: list[float]
    acf_conf_upper: list[float]
    acf_conf_lower: list[float]
    pacf_conf_upper: list[float]
    pacf_conf_lower: list[float]
    nlags: int


class ADFTestResult(BaseModel):
    """Augmented Dickey-Fuller stationarity test results."""
    adf_statistic: float
    p_value: float
    used_lag: int
    n_obs: int
    critical_values: dict[str, float]  # "1%", "5%", "10%" → value
    is_stationary: bool  # True if p_value < 0.05


class SeasonalDecompResult(BaseModel):
    """Seasonal decomposition results (trend, seasonal, residual)."""
    dates: list[str]
    observed: list[float | None]
    trend: list[float | None]
    seasonal: list[float | None]
    residual: list[float | None]
    period: int
    model: str  # "additive" or "multiplicative"


class WeatherBinResult(BaseModel):
    """Binned weather data for visualization."""
    bin_midpoints: list[float]
    avg_arrivals: list[float]
    bin_labels: list[str]


class EDAResponse(BaseModel):
    dataset_id: str
    rows: int
    columns: int
    column_summaries: list[ColumnSummary]
    correlations: dict[str, float]  # column → correlation with target
    missing_by_column: dict[str, float]  # column → missing %
    target_stats: dict[str, float]  # mean, std, min, max, median
    dow_averages: dict[str, float]  # Monday→Sunday average
    monthly_averages: dict[str, float]  # Jan→Dec average
    numeric_columns: list[str]
    date_column: str | None = None
    # Advanced time series analytics
    correlation_matrix: dict[str, dict[str, float]] | None = None  # full correlation matrix
    acf_pacf: ACFPACFResult | None = None
    adf_test: ADFTestResult | None = None
    seasonal_decomposition: SeasonalDecompResult | None = None
    weather_bins: dict[str, WeatherBinResult] | None = None  # temp, wind, precip


# ---------------------------------------------------------------------------
# Feature Selection
# ---------------------------------------------------------------------------
class FeatureSelectionRequest(BaseModel):
    dataset_id: str
    method: str = "permutation"  # "permutation", "shap", "mutual_info"
    top_k: int | None = None


class FeatureSelectionResponse(BaseModel):
    selected_features: list[str]
    importances: dict[str, float]
    method: str
