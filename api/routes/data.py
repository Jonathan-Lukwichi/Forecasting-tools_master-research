"""
Data upload, validation, fusion, and feature engineering endpoints.

Wraps existing app_core services without modifying them.
"""
from __future__ import annotations

import io
from typing import Annotated, Any

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query

from api.dependencies import get_current_user, get_dataset_store
from api.schemas.data import (
    ColumnSummary,
    EDARequest,
    EDAResponse,
    FuseRequest,
    FuseResponse,
    FeatureEngineeringRequest,
    FeatureEngineeringResponse,
    UploadResponse,
    ValidateRequest,
    ValidateResponse,
)
from api.services.dataset_store import DatasetStore

router = APIRouter(prefix="/data", tags=["Data"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _read_upload(file: UploadFile) -> pd.DataFrame:
    """Read CSV, Excel, or Parquet from an upload."""
    content = file.file.read()
    name = (file.filename or "").lower()

    if name.endswith(".csv"):
        return pd.read_csv(io.BytesIO(content))
    elif name.endswith((".xlsx", ".xls")):
        return pd.read_excel(io.BytesIO(content))
    elif name.endswith(".parquet"):
        return pd.read_parquet(io.BytesIO(content))
    else:
        raise HTTPException(400, f"Unsupported file type: {file.filename}")


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------
@router.post("/upload", response_model=UploadResponse)
def upload_dataset(
    file: UploadFile = File(...),
    dataset_type: str = Query("patient", description="patient|weather|calendar|reason"),
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    df = _read_upload(file)
    dataset_id = store.store(df, metadata={"type": dataset_type, "filename": file.filename})
    preview = df.head(5).replace({float("nan"): None}).to_dict(orient="records")

    return UploadResponse(
        filename=file.filename or "",
        rows=len(df),
        columns=list(df.columns),
        preview=preview,
        dataset_id=dataset_id,
    )


# ---------------------------------------------------------------------------
# Validate
# ---------------------------------------------------------------------------
@router.post("/validate", response_model=ValidateResponse)
def validate_dataset(
    body: ValidateRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    from app_core.services.data_service import DataService

    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    svc = DataService()

    # Detect datetime column
    dt_result = svc.detect_datetime_column(entry.df)
    detected_col = dt_result.data if dt_result.success else None

    # Validate
    errors: list[str] = []
    warnings: list[str] = []

    if body.required_columns:
        missing = [c for c in body.required_columns if c not in entry.df.columns]
        if missing:
            errors.append(f"Missing columns: {missing}")

    val_result = svc.validate_data(
        entry.df,
        required_columns=body.required_columns,
        date_column=body.date_column or detected_col or "",
    )

    if not val_result.success:
        errors.append(val_result.error or "Validation failed")

    return ValidateResponse(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
        detected_date_column=detected_col,
        row_count=len(entry.df),
        column_count=len(entry.df.columns),
    )


# ---------------------------------------------------------------------------
# Fuse datasets — uses proper fusion logic from app_core
# ---------------------------------------------------------------------------
def _find_datetime_col(df: pd.DataFrame) -> str | None:
    """Find datetime column in DataFrame."""
    for col in ["datetime", "Date", "date", "timestamp", "ds", "time"]:
        if col in df.columns:
            return col
    return None


def _normalize_to_date(dt_series: pd.Series) -> pd.Series:
    """Convert datetime to date-only (midnight) for daily aggregation.

    Handles timezone-aware datetimes by converting to timezone-naive first.
    """
    dt = pd.to_datetime(dt_series, errors="coerce")
    # Remove timezone info if present (convert to naive datetime)
    if dt.dt.tz is not None:
        dt = dt.dt.tz_localize(None)
    return dt.dt.normalize()


def _prep_for_fusion(df: pd.DataFrame, dataset_type: str) -> pd.DataFrame:
    """
    Prepare a dataset for fusion by creating a normalized Date column.
    Mirrors logic from app_core/data/fusion.py but without Streamlit deps.
    """
    df = df.copy()
    dt_col = _find_datetime_col(df)

    if dt_col is None:
        raise ValueError(f"{dataset_type} dataset must have a datetime column")

    # Create normalized Date column for merging
    df["Date"] = _normalize_to_date(df[dt_col])
    df = df.dropna(subset=["Date"])

    return df


@router.post("/fuse", response_model=FuseResponse)
def fuse_datasets(
    body: FuseRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    """
    Fuse patient, weather, calendar, and reason datasets.
    Uses inner joins on Date column (matching Streamlit fusion logic).
    """
    try:
        patient_df = store.get(body.patient_dataset_id).df
    except KeyError:
        raise HTTPException(404, "Patient dataset not found")

    weather_df = None
    calendar_df = None
    reason_df = None

    if body.weather_dataset_id:
        try:
            weather_df = store.get(body.weather_dataset_id).df
        except KeyError:
            raise HTTPException(404, "Weather dataset not found")

    if body.calendar_dataset_id:
        try:
            calendar_df = store.get(body.calendar_dataset_id).df
        except KeyError:
            raise HTTPException(404, "Calendar dataset not found")

    if body.reason_dataset_id:
        try:
            reason_df = store.get(body.reason_dataset_id).df
        except KeyError:
            raise HTTPException(404, "Reason dataset not found")

    processing_log = []

    try:
        # Prepare patient data
        p = _prep_for_fusion(patient_df, "Patient")
        processing_log.append(f"Patient: {len(p)} rows prepared")

        # Find target column (patient_count, ED, Target_1, etc.)
        target_col = None
        for col in ["patient_count", "ED", "Target_1", "patients", "count", "arrivals"]:
            if col in p.columns:
                target_col = col
                break

        if target_col is None:
            # Try to find any numeric column that looks like a count
            for col in p.columns:
                if col not in ["Date", "datetime", "date", "id", "ID"] and pd.api.types.is_numeric_dtype(p[col]):
                    target_col = col
                    break

        if target_col and target_col != "ED":
            p = p.rename(columns={target_col: "ED"})
            processing_log.append(f"Renamed '{target_col}' to 'ED'")

        # Start with patient data
        merged = p.copy()

        # Merge weather if provided
        if weather_df is not None:
            w = _prep_for_fusion(weather_df, "Weather")
            processing_log.append(f"Weather: {len(w)} rows prepared")
            merged = merged.merge(w, on="Date", how="inner", suffixes=("", "_weather"))
            processing_log.append(f"After weather merge: {len(merged)} rows")

        # Merge calendar if provided
        if calendar_df is not None:
            c = _prep_for_fusion(calendar_df, "Calendar")
            processing_log.append(f"Calendar: {len(c)} rows prepared")
            merged = merged.merge(c, on="Date", how="inner", suffixes=("", "_cal"))
            processing_log.append(f"After calendar merge: {len(merged)} rows")

        # Merge reason if provided
        if reason_df is not None:
            r = _prep_for_fusion(reason_df, "Reason")
            processing_log.append(f"Reason: {len(r)} rows prepared")
            merged = merged.merge(r, on="Date", how="inner", suffixes=("", "_reason"))
            processing_log.append(f"After reason merge: {len(merged)} rows")

        if merged.empty:
            raise HTTPException(
                422,
                "Fusion resulted in empty dataset. Check that datasets have overlapping date ranges."
            )

        # Remove duplicate columns (from suffixes)
        merged = merged.loc[:, ~merged.columns.duplicated()]

        # Sort by date
        merged = merged.sort_values("Date").reset_index(drop=True)

        processing_log.append(f"Final: {len(merged)} rows, {len(merged.columns)} columns")

        fused_id = store.store(merged, metadata={"type": "fused"})

        return FuseResponse(
            dataset_id=fused_id,
            rows=len(merged),
            columns=list(merged.columns),
            processing_report={"log": processing_log},
        )

    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        raise HTTPException(500, f"Fusion failed: {str(e)}")


# ---------------------------------------------------------------------------
# Feature Engineering
# ---------------------------------------------------------------------------
@router.post("/features/engineer", response_model=FeatureEngineeringResponse)
def engineer_features(
    body: FeatureEngineeringRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    from app_core.services.data_service import DataService

    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    svc = DataService()

    # Generate lag features
    lag_result = svc.generate_lag_features(
        entry.df,
        target_column="ED",
        n_lags=body.n_lags,
        n_horizons=body.n_horizons,
    )
    if not lag_result.success:
        raise HTTPException(422, lag_result.error or "Lag feature generation failed")

    processed_df = lag_result.data

    # Temporal split
    split_result = svc.compute_temporal_split(
        processed_df,
        date_column="Date",
        train_ratio=body.train_ratio,
        cal_ratio=body.cal_ratio,
    )
    if not split_result.success:
        raise HTTPException(422, split_result.error or "Temporal split failed")

    split_info = split_result.data

    # Identify feature and target columns
    target_cols = [c for c in processed_df.columns if c.startswith("Target_")]
    exclude = {"Date", "datetime"} | set(target_cols)
    feature_cols = [c for c in processed_df.columns if c not in exclude and processed_df[c].dtype in ("float64", "int64", "float32", "int32")]

    # Store artifacts on the entry
    entry.df = processed_df
    entry.feature_names = feature_cols
    entry.target_names = target_cols
    entry.train_idx = split_info.get("train_idx")
    entry.cal_idx = split_info.get("cal_idx")
    entry.test_idx = split_info.get("test_idx")

    return FeatureEngineeringResponse(
        dataset_id=body.dataset_id,
        feature_names=feature_cols,
        target_names=target_cols,
        train_size=len(split_info.get("train_idx", [])),
        cal_size=len(split_info.get("cal_idx", [])),
        test_size=len(split_info.get("test_idx", [])),
        total_features=len(feature_cols),
    )


# ---------------------------------------------------------------------------
# EDA (Exploratory Data Analysis)
# ---------------------------------------------------------------------------
@router.post("/explore", response_model=EDAResponse)
def explore_dataset(
    body: EDARequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    """
    Compute exploratory data analysis statistics for a dataset.

    === TRIANGULATION RECORD ===
    Task: EDA endpoint for dataset exploration
    Approach: Compute summary stats, correlations, DOW/monthly patterns server-side

    Vertex 1 (Academic):
      Source: Hyndman & Athanasopoulos (2021). "Forecasting: Principles and Practice", Ch.2.
      Finding: EDA for time series must include seasonal patterns (DOW, monthly),
               autocorrelation, and trend decomposition
      Relevance: DOW + monthly averages capture seasonal patterns in ED arrivals

    Vertex 2 (Industry):
      Source: https://www.kaggle.com/code/raminhuseyn/time-series-forecasting-exploratory-data-analysis
      Pattern: Summary stats + correlation matrix + temporal aggregations
      Adaptation: Return JSON-serializable stats for frontend charting

    Vertex 3 (Internal):
      Files checked: pages/04_Explore_Data.py (DOW donut, monthly donut, weather correlation)
      Consistency: Confirmed — replicates same computations via API

    Verdict: PROCEED
    =============================
    """
    import numpy as np

    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    df = entry.df
    target = body.target_column

    # Detect date column
    date_col = None
    for candidate in ["Date", "datetime", "date", "timestamp", "ds"]:
        if candidate in df.columns:
            date_col = candidate
            break

    # Column summaries
    summaries = []
    for col in df.columns:
        s = df[col]
        summary = ColumnSummary(
            name=col,
            dtype=str(s.dtype),
            non_null=int(s.notna().sum()),
            null_count=int(s.isna().sum()),
            null_pct=round(float(s.isna().mean() * 100), 2),
            unique=int(s.nunique()),
        )
        if pd.api.types.is_numeric_dtype(s):
            desc = s.describe()
            summary.mean = round(float(desc.get("mean", 0)), 4)
            summary.std = round(float(desc.get("std", 0)), 4)
            summary.min = round(float(desc.get("min", 0)), 4)
            summary.max = round(float(desc.get("max", 0)), 4)
        summaries.append(summary)

    # Numeric columns
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]

    # Correlations with target
    correlations: dict[str, float] = {}
    if target in df.columns and pd.api.types.is_numeric_dtype(df[target]):
        corr_series = df[numeric_cols].corr()[target].drop(target, errors="ignore")
        top_corr = corr_series.abs().nlargest(body.top_correlations)
        correlations = {
            col: round(float(corr_series[col]), 4) for col in top_corr.index
        }

    # Missing by column
    missing = {
        col: round(float(df[col].isna().mean() * 100), 2)
        for col in df.columns
        if df[col].isna().any()
    }

    # Target stats
    target_stats: dict[str, float] = {}
    if target in df.columns and pd.api.types.is_numeric_dtype(df[target]):
        ts = df[target].dropna()
        target_stats = {
            "mean": round(float(ts.mean()), 2),
            "std": round(float(ts.std()), 2),
            "min": round(float(ts.min()), 2),
            "max": round(float(ts.max()), 2),
            "median": round(float(ts.median()), 2),
        }

    # DOW averages
    dow_averages: dict[str, float] = {}
    if date_col and target in df.columns:
        try:
            dt_series = pd.to_datetime(df[date_col], errors="coerce")
            temp = df[[target]].copy()
            temp["_dow"] = dt_series.dt.day_name()
            dow_avg = temp.groupby("_dow")[target].mean()
            day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            dow_averages = {
                d: round(float(dow_avg.get(d, 0)), 2)
                for d in day_order if d in dow_avg.index
            }
        except Exception:
            pass

    # Monthly averages
    monthly_averages: dict[str, float] = {}
    if date_col and target in df.columns:
        try:
            dt_series = pd.to_datetime(df[date_col], errors="coerce")
            temp = df[[target]].copy()
            temp["_month"] = dt_series.dt.month_name()
            month_avg = temp.groupby("_month")[target].mean()
            month_order = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
            ]
            monthly_averages = {
                m: round(float(month_avg.get(m, 0)), 2)
                for m in month_order if m in month_avg.index
            }
        except Exception:
            pass

    return EDAResponse(
        dataset_id=body.dataset_id,
        rows=len(df),
        columns=len(df.columns),
        column_summaries=summaries,
        correlations=correlations,
        missing_by_column=missing,
        target_stats=target_stats,
        dow_averages=dow_averages,
        monthly_averages=monthly_averages,
        numeric_columns=numeric_cols,
        date_column=date_col,
    )


# ---------------------------------------------------------------------------
# List datasets
# ---------------------------------------------------------------------------
@router.get("/datasets")
def list_datasets(
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
) -> list[dict[str, Any]]:
    return store.list_datasets()


# ---------------------------------------------------------------------------
# Get dataset preview
# ---------------------------------------------------------------------------
@router.get("/datasets/{dataset_id}")
def get_dataset(
    dataset_id: str,
    rows: int = Query(20, ge=1, le=500),
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
) -> dict[str, Any]:
    try:
        entry = store.get(dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    return {
        "dataset_id": dataset_id,
        "total_rows": len(entry.df),
        "columns": list(entry.df.columns),
        "dtypes": {c: str(entry.df[c].dtype) for c in entry.df.columns},
        "preview": entry.df.head(rows).replace({float("nan"): None}).to_dict(orient="records"),
        "metadata": entry.metadata,
    }
