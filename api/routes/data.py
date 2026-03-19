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
    ACFPACFResult,
    ADFTestResult,
    ColumnSummary,
    EDARequest,
    EDAResponse,
    FetchDatasetRequest,
    FetchDatasetResponse,
    FuseRequest,
    FuseResponse,
    FeatureEngineeringRequest,
    FeatureEngineeringResponse,
    SeasonalDecompResult,
    UploadResponse,
    ValidateRequest,
    ValidateResponse,
    WeatherBinResult,
)
from api.services.dataset_store import DatasetStore
from api.services.supabase_service import (
    get_available_hospitals,
    fetch_dataset_by_hospital,
)

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
# List available hospitals (from Supabase)
# ---------------------------------------------------------------------------
@router.get("/hospitals")
def list_hospitals(
    _user: dict = Depends(get_current_user),
) -> list[str]:
    """
    Get list of available hospitals from Supabase.

    Returns a sorted list of hospital names that have data in the database.
    """
    return get_available_hospitals()


# ---------------------------------------------------------------------------
# Fetch dataset by hospital name (from Supabase)
# ---------------------------------------------------------------------------
@router.post("/fetch", response_model=FetchDatasetResponse)
def fetch_dataset(
    body: FetchDatasetRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    """
    Fetch a dataset from Supabase filtered by hospital name and date range.

    This mirrors the Streamlit HospitalDataService.fetch_dataset_by_hospital().
    """
    df = fetch_dataset_by_hospital(
        dataset_type=body.dataset_type,
        hospital_name=body.hospital_name,
        start_date=body.start_date,
        end_date=body.end_date,
    )

    if df.empty:
        raise HTTPException(
            404,
            f"No {body.dataset_type} data found for hospital '{body.hospital_name}'"
        )

    # Clean datetime column (strip timezone, standardize name)
    dt_col = None
    for col in ["datetime", "Date", "date", "timestamp", "ds"]:
        if col in df.columns:
            dt_col = col
            break

    if dt_col:
        df[dt_col] = pd.to_datetime(df[dt_col], errors="coerce")
        if df[dt_col].dt.tz is not None:
            df[dt_col] = df[dt_col].dt.tz_localize(None)
        # Standardize to 'datetime' column name
        if dt_col != "datetime":
            df = df.rename(columns={dt_col: "datetime"})

    # Remove empty columns (all NaN or empty strings)
    empty_cols = [
        col for col in df.columns
        if df[col].isna().all() or (df[col].astype(str).str.strip() == "").all()
    ]
    if empty_cols:
        df = df.drop(columns=empty_cols)

    # For reason dataset: remove total_arrivals (duplicates Target_1)
    if body.dataset_type == "reason":
        for col in list(df.columns):
            if col.lower() == "total_arrivals":
                df = df.drop(columns=[col])
                break

    # Store in DatasetStore
    dataset_id = store.store(df, metadata={
        "type": body.dataset_type,
        "hospital": body.hospital_name,
        "source": "supabase",
    })

    preview = df.head(5).replace({float("nan"): None}).to_dict(orient="records")

    return FetchDatasetResponse(
        dataset_id=dataset_id,
        dataset_type=body.dataset_type,
        hospital_name=body.hospital_name,
        rows=len(df),
        columns=list(df.columns),
        preview=preview,
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
# Feature Engineering — mirrors Streamlit logic
# ---------------------------------------------------------------------------
@router.post("/features/engineer", response_model=FeatureEngineeringResponse)
def engineer_features(
    body: FeatureEngineeringRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    df = entry.df.copy()

    # Verify ED column exists
    if "ED" not in df.columns:
        raise HTTPException(422, "Dataset must have 'ED' column for feature engineering")

    # Verify Date column exists
    if "Date" not in df.columns:
        raise HTTPException(422, "Dataset must have 'Date' column for feature engineering")

    # Ensure Date is timezone-naive and sorted
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    if df["Date"].dt.tz is not None:
        df["Date"] = df["Date"].dt.tz_localize(None)
    df = df.sort_values("Date").reset_index(drop=True)

    # Generate lag features (ED_1, ED_2, ..., ED_n)
    for i in range(1, body.n_lags + 1):
        df[f"ED_{i}"] = df["ED"].shift(i)

    # Generate target columns (Target_1, Target_2, ..., Target_n)
    for i in range(1, body.n_horizons + 1):
        df[f"Target_{i}"] = df["ED"].shift(-i)

    # Only drop rows where lag/target columns have NaN (edges of the dataset)
    lag_cols = [f"ED_{i}" for i in range(1, body.n_lags + 1)]
    target_cols = [f"Target_{i}" for i in range(1, body.n_horizons + 1)]
    required_cols = lag_cols + target_cols

    df = df.dropna(subset=required_cols).reset_index(drop=True)

    if df.empty:
        raise HTTPException(422, "Feature engineering resulted in empty dataset")

    # Temporal split
    n = len(df)
    train_end = int(n * body.train_ratio)
    cal_end = int(n * (body.train_ratio + body.cal_ratio))

    train_idx = list(range(0, train_end))
    cal_idx = list(range(train_end, cal_end))
    test_idx = list(range(cal_end, n))

    # Identify feature columns (numeric, excluding Date and targets)
    exclude_cols = {"Date", "datetime", "date", "id", "created_at"} | set(target_cols)
    feature_cols = [
        c for c in df.columns
        if c not in exclude_cols
        and not c.startswith("Target_")
        and pd.api.types.is_numeric_dtype(df[c])
    ]

    # Update entry with processed data
    entry.df = df
    entry.feature_names = feature_cols
    entry.target_names = target_cols
    entry.train_idx = train_idx
    entry.cal_idx = cal_idx
    entry.test_idx = test_idx

    return FeatureEngineeringResponse(
        dataset_id=body.dataset_id,
        feature_names=feature_cols,
        target_names=target_cols,
        train_size=len(train_idx),
        cal_size=len(cal_idx),
        test_size=len(test_idx),
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

    # =========================================================================
    # Advanced Time Series Analytics (mirrors Streamlit EDA)
    # =========================================================================

    # Full correlation matrix
    correlation_matrix: dict[str, dict[str, float]] | None = None
    if len(numeric_cols) >= 2:
        try:
            corr_df = df[numeric_cols].corr(method="spearman")
            correlation_matrix = {
                col: {c: round(float(v), 4) for c, v in row.items()}
                for col, row in corr_df.to_dict().items()
            }
        except Exception:
            pass

    # ACF/PACF for target column
    acf_pacf_result: ACFPACFResult | None = None
    if target in df.columns and pd.api.types.is_numeric_dtype(df[target]):
        try:
            from statsmodels.tsa.stattools import acf as sm_acf, pacf as sm_pacf

            y = df[target].dropna().values
            if len(y) >= 20:
                nlags = min(40, len(y) // 2 - 1)
                acf_vals, confint_acf = sm_acf(y, nlags=nlags, alpha=0.05, fft=True)
                pacf_vals, confint_pacf = sm_pacf(y, nlags=nlags, method="ywm", alpha=0.05)

                acf_pacf_result = ACFPACFResult(
                    acf_values=[round(float(v), 4) for v in acf_vals],
                    pacf_values=[round(float(v), 4) for v in pacf_vals],
                    acf_conf_upper=[round(float(v), 4) for v in confint_acf[:, 1]],
                    acf_conf_lower=[round(float(v), 4) for v in confint_acf[:, 0]],
                    pacf_conf_upper=[round(float(v), 4) for v in confint_pacf[:, 1]],
                    pacf_conf_lower=[round(float(v), 4) for v in confint_pacf[:, 0]],
                    nlags=nlags,
                )
        except Exception:
            pass

    # ADF Stationarity Test
    adf_result: ADFTestResult | None = None
    if target in df.columns and pd.api.types.is_numeric_dtype(df[target]):
        try:
            from statsmodels.tsa.stattools import adfuller

            y = df[target].dropna().values
            if len(y) >= 20:
                result = adfuller(y)
                adf_result = ADFTestResult(
                    adf_statistic=round(float(result[0]), 4),
                    p_value=round(float(result[1]), 6),
                    used_lag=int(result[2]),
                    n_obs=int(result[3]),
                    critical_values={k: round(float(v), 4) for k, v in result[4].items()},
                    is_stationary=result[1] < 0.05,
                )
        except Exception:
            pass

    # Seasonal Decomposition
    seasonal_result: SeasonalDecompResult | None = None
    if date_col and target in df.columns:
        try:
            from statsmodels.tsa.seasonal import seasonal_decompose

            temp_df = df[[date_col, target]].copy()
            temp_df[date_col] = pd.to_datetime(temp_df[date_col], errors="coerce")
            temp_df = temp_df.dropna().sort_values(date_col).set_index(date_col)

            # Daily data → period=7 (weekly seasonality)
            period = 7
            if len(temp_df) >= 2 * period + 1:
                result = seasonal_decompose(
                    temp_df[target], model="additive", period=period, extrapolate_trend="freq"
                )
                dates = [d.strftime("%Y-%m-%d") for d in result.observed.index]
                seasonal_result = SeasonalDecompResult(
                    dates=dates,
                    observed=[round(float(v), 2) if pd.notna(v) else None for v in result.observed],
                    trend=[round(float(v), 2) if pd.notna(v) else None for v in result.trend],
                    seasonal=[round(float(v), 2) if pd.notna(v) else None for v in result.seasonal],
                    residual=[round(float(v), 2) if pd.notna(v) else None for v in result.resid],
                    period=period,
                    model="additive",
                )
        except Exception:
            pass

    # Weather Binning (temperature, wind, precipitation vs arrivals)
    weather_bins: dict[str, WeatherBinResult] | None = None
    weather_cols_map = {
        "temperature": ["Average_Temp", "average_temp", "temp"],
        "wind": ["Average_wind", "average_wind", "wind"],
        "precipitation": ["Total_precipitation", "total_precipitation", "precip"],
    }

    if target in df.columns:
        weather_bins = {}
        for weather_type, possible_cols in weather_cols_map.items():
            weather_col = None
            for col in possible_cols:
                if col in df.columns:
                    weather_col = col
                    break

            if weather_col:
                try:
                    temp_data = df[[weather_col, target]].dropna()
                    if len(temp_data) >= 10:
                        n_bins = 12
                        temp_data["bin"] = pd.cut(temp_data[weather_col], bins=n_bins)
                        agg = temp_data.groupby("bin", observed=True).agg({
                            weather_col: "mean",
                            target: "mean"
                        }).dropna()

                        if len(agg) > 0:
                            weather_bins[weather_type] = WeatherBinResult(
                                bin_midpoints=[round(float(v), 2) for v in agg[weather_col]],
                                avg_arrivals=[round(float(v), 2) for v in agg[target]],
                                bin_labels=[str(idx) for idx in agg.index],
                            )
                except Exception:
                    pass

        if not weather_bins:
            weather_bins = None

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
        # Advanced analytics
        correlation_matrix=correlation_matrix,
        acf_pacf=acf_pacf_result,
        adf_test=adf_result,
        seasonal_decomposition=seasonal_result,
        weather_bins=weather_bins,
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
