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
