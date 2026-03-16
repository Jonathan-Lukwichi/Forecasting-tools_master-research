"""
Model training and comparison endpoints.

Wraps app_core ModelingService for ML models and
arima_pipeline / sarimax_pipeline for baseline models.
"""
from __future__ import annotations

import time
import uuid
from typing import Annotated, Any

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from api.dependencies import get_current_user, get_dataset_store
from api.schemas.ml import (
    ModelComparisonResponse,
    TrainBaselineRequest,
    TrainRequest,
    TrainResponse,
)
from api.services.dataset_store import DatasetStore

router = APIRouter(prefix="/models", tags=["Models"])


# ---------------------------------------------------------------------------
# Train ML model (XGBoost, LSTM, ANN, Hybrids)
# ---------------------------------------------------------------------------
@router.post("/train", response_model=TrainResponse)
def train_model(
    body: TrainRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    from app_core.services.modeling_service import ModelingService, ModelConfig

    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    if entry.feature_names is None or entry.train_idx is None:
        raise HTTPException(
            422, "Run feature engineering first (POST /api/data/features/engineer)"
        )

    df = entry.df
    feature_cols = entry.feature_names
    target_cols = entry.target_names or [f"Target_{h}" for h in body.horizons]

    # Prepare arrays
    X = df[feature_cols].values
    X_train = X[entry.train_idx]
    X_test = X[entry.test_idx]
    X_cal = X[entry.cal_idx] if entry.cal_idx is not None else None

    config = ModelConfig(
        model_type=body.model_type,
        target_column="ED",
        horizons=body.horizons,
        hyperparameters=body.hyperparameters,
        auto_tune=body.auto_tune,
        n_trials=body.n_trials,
    )

    svc = ModelingService()
    model_id = str(uuid.uuid4())

    # Train per-horizon
    all_metrics: dict[str, float] = {}
    t0 = time.perf_counter()

    for target_col in target_cols:
        if target_col not in df.columns:
            continue
        y = df[target_col].values
        y_train = y[entry.train_idx]
        y_test = y[entry.test_idx]
        y_cal = y[entry.cal_idx] if entry.cal_idx is not None else None

        result = svc.train_model(X_train, y_train, X_test, y_test, config, X_cal, y_cal)
        if result.success and result.data:
            for k, v in result.data.metrics.items():
                all_metrics[f"{target_col}_{k}"] = v

    training_time = time.perf_counter() - t0

    # Aggregate metrics (average across horizons)
    metric_keys = {"rmse", "mae", "mape"}
    avg_metrics = {}
    for mk in metric_keys:
        vals = [v for k, v in all_metrics.items() if k.endswith(f"_{mk}")]
        if vals:
            avg_metrics[mk] = round(sum(vals) / len(vals), 4)

    store.store_model_result(body.dataset_id, model_id, {
        "model_type": body.model_type,
        "metrics": avg_metrics,
        "all_metrics": all_metrics,
        "training_time": training_time,
    })

    return TrainResponse(
        model_id=model_id,
        model_type=body.model_type,
        model_name=body.model_type.upper().replace("_", " + "),
        metrics=avg_metrics,
        training_time=round(training_time, 2),
    )


# ---------------------------------------------------------------------------
# Train baseline model (ARIMA / SARIMAX)
# ---------------------------------------------------------------------------
@router.post("/train/baseline", response_model=TrainResponse)
def train_baseline(
    body: TrainBaselineRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    model_id = str(uuid.uuid4())
    t0 = time.perf_counter()

    if body.model_type == "arima":
        from app_core.models.arima_pipeline import fit_arima

        result = fit_arima(
            entry.df,
            order=body.order,
            auto=body.auto_order,
        )
    elif body.model_type == "sarimax":
        from app_core.models.sarimax_pipeline import fit_sarimax

        result = fit_sarimax(
            entry.df,
            order=body.order,
            seasonal_order=body.seasonal_order,
            auto=body.auto_order,
        )
    else:
        raise HTTPException(400, f"Unknown baseline type: {body.model_type}")

    training_time = time.perf_counter() - t0

    metrics = result.get("metrics", {}) if isinstance(result, dict) else {}

    store.store_model_result(body.dataset_id, model_id, {
        "model_type": body.model_type,
        "metrics": metrics,
        "training_time": training_time,
        "result": result,
    })

    return TrainResponse(
        model_id=model_id,
        model_type=body.model_type,
        model_name=body.model_type.upper(),
        metrics=metrics,
        training_time=round(training_time, 2),
    )


# ---------------------------------------------------------------------------
# Compare models
# ---------------------------------------------------------------------------
@router.get("/compare/{dataset_id}", response_model=ModelComparisonResponse)
def compare_models(
    dataset_id: str,
    metric: str = "rmse",
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    try:
        entry = store.get(dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    if not entry.model_results:
        raise HTTPException(404, "No trained models found for this dataset")

    ranking = []
    for model_id, result in entry.model_results.items():
        metrics = result.get("metrics", {})
        ranking.append({
            "model_id": model_id,
            "model": result.get("model_type", "unknown"),
            "rmse": metrics.get("rmse", float("inf")),
            "mae": metrics.get("mae", float("inf")),
            "mape": metrics.get("mape", float("inf")),
        })

    ranking.sort(key=lambda x: x.get(metric, float("inf")))
    for i, r in enumerate(ranking):
        r["rank"] = i + 1

    return ModelComparisonResponse(
        best_model=ranking[0]["model"] if ranking else "none",
        ranking=ranking,
        metric_used=metric,
    )
