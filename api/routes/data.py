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
# Fuse datasets
# ---------------------------------------------------------------------------
@router.post("/fuse", response_model=FuseResponse)
def fuse_datasets(
    body: FuseRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    from app_core.services.data_service import DataService

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

    svc = DataService()
    result = svc.fuse_datasets(patient_df, weather_df, calendar_df, reason_df)

    if not result.success:
        raise HTTPException(422, result.error or "Fusion failed")

    fused_df = result.data
    fused_id = store.store(fused_df, metadata={"type": "fused"})

    return FuseResponse(
        dataset_id=fused_id,
        rows=len(fused_df),
        columns=list(fused_df.columns),
        processing_report=result.data if isinstance(result.data, dict) else {},
    )


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
