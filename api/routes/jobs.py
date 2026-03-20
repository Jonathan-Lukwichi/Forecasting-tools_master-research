"""
Background job management endpoints.

Provides REST polling and WebSocket streaming for Celery task progress.
Falls back to synchronous execution when Celery/Redis is not available.

=== TRIANGULATION RECORD ===
Task: Job status API for background ML training tasks
Approach: REST polling (GET /api/jobs/{id}) + WebSocket streaming (WS /api/ws/jobs/{id})

Vertex 1 (Academic):
  Source: Huyen, C. (2022). "Designing Machine Learning Systems", Ch.9. O'Reilly.
  Finding: Async ML pipelines need status tracking, cancellation, and result retrieval.
  Relevance: Training can take minutes — users need progress feedback.

Vertex 2 (Industry):
  Source: https://celery.school/celery-progress-bars-with-fastapi-htmx
  Source: https://docs.santosdevco.com/celeryfastapi/lab5/
  Pattern: Celery AsyncResult for polling, WebSocket for push-based updates.
  Adaptation: Both REST and WebSocket endpoints for flexibility.

Vertex 3 (Internal):
  Files checked: api/schemas/ml.py (TrainProgressEvent exists), api/workers/celery_app.py
  Consistency: Confirmed — tasks use update_state(), AsyncResult reads state.

Verdict: PROCEED
=============================
"""
from __future__ import annotations

import asyncio
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect

from api.dependencies import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# In-memory store for synchronous job results (fallback when Celery unavailable)
_sync_results: dict[str, dict[str, Any]] = {}

# Lazy check for Celery/Redis availability (don't run at import time to save memory)
_celery_checked = False
_celery_available = False


def _check_celery_availability() -> bool:
    """Lazy check for Celery/Redis availability."""
    global _celery_checked, _celery_available
    if _celery_checked:
        return _celery_available
    _celery_checked = True
    try:
        from api.workers.celery_app import celery_app
        # Try to ping Redis with short timeout
        result = celery_app.control.ping(timeout=0.5)
        _celery_available = bool(result)
    except Exception:
        _celery_available = False
    return _celery_available


def _get_celery():
    """Lazy import Celery app to avoid import errors when Celery is not installed."""
    from api.workers.celery_app import celery_app
    return celery_app


# ---------------------------------------------------------------------------
# Submit training job
# ---------------------------------------------------------------------------
@router.post("/train")
def submit_training_job(
    body: dict[str, Any],
    _user: dict = Depends(get_current_user),
) -> dict[str, str]:
    """Submit an ML training job. Uses Celery if available, else runs synchronously."""

    if _check_celery_availability():
        # Async mode: submit to Celery queue
        from api.workers.training_tasks import train_ml_model
        task = train_ml_model.delay(
            dataset_id=body["dataset_id"],
            model_type=body["model_type"],
            horizons=body.get("horizons", [1, 2, 3, 4, 5, 6, 7]),
            hyperparameters=body.get("hyperparameters", {}),
            auto_tune=body.get("auto_tune", False),
            n_trials=body.get("n_trials", 50),
        )
        return {"job_id": task.id, "status": "queued"}

    # Sync fallback: run training directly
    job_id = str(uuid.uuid4())
    _sync_results[job_id] = {"job_id": job_id, "status": "running", "progress": 0.1}

    try:
        result = _run_ml_training_sync(
            dataset_id=body["dataset_id"],
            model_type=body["model_type"],
            horizons=body.get("horizons", [1, 2, 3, 4, 5, 6, 7]),
            hyperparameters=body.get("hyperparameters", {}),
            auto_tune=body.get("auto_tune", False),
            n_trials=body.get("n_trials", 50),
        )
        _sync_results[job_id] = {"job_id": job_id, "status": "completed", "progress": 1.0, "result": result}
    except Exception as e:
        _sync_results[job_id] = {"job_id": job_id, "status": "failed", "error": str(e)}

    return {"job_id": job_id, "status": "queued"}


@router.post("/train/baseline")
def submit_baseline_job(
    body: dict[str, Any],
    _user: dict = Depends(get_current_user),
) -> dict[str, str]:
    """Submit a baseline model training job. Uses Celery if available, else runs synchronously."""

    if _check_celery_availability():
        from api.workers.training_tasks import train_baseline_model
        task = train_baseline_model.delay(
            dataset_id=body["dataset_id"],
            model_type=body["model_type"],
            order=body.get("order"),
            seasonal_order=body.get("seasonal_order"),
            auto_order=body.get("auto_order", True),
        )
        return {"job_id": task.id, "status": "queued"}

    # Sync fallback
    job_id = str(uuid.uuid4())
    _sync_results[job_id] = {"job_id": job_id, "status": "running", "progress": 0.1}

    try:
        result = _run_baseline_training_sync(
            dataset_id=body["dataset_id"],
            model_type=body["model_type"],
            order=body.get("order"),
            seasonal_order=body.get("seasonal_order"),
            auto_order=body.get("auto_order", True),
        )
        _sync_results[job_id] = {"job_id": job_id, "status": "completed", "progress": 1.0, "result": result}
    except Exception as e:
        _sync_results[job_id] = {"job_id": job_id, "status": "failed", "error": str(e)}

    return {"job_id": job_id, "status": "queued"}


# ---------------------------------------------------------------------------
# Poll job status (REST)
# ---------------------------------------------------------------------------
@router.get("/{job_id}")
def get_job_status(
    job_id: str,
    _user: dict = Depends(get_current_user),
) -> dict[str, Any]:
    """Poll the status of a background job."""

    # Check sync results first (fallback mode)
    if job_id in _sync_results:
        return _sync_results[job_id]

    # Check Celery if available
    if not _check_celery_availability():
        return {"job_id": job_id, "status": "failed", "error": "Job not found"}

    result = _get_celery().AsyncResult(job_id)

    if result.state == "PENDING":
        return {"job_id": job_id, "status": "queued", "progress": 0.0, "message": "Waiting in queue..."}

    if result.state == "PROGRESS":
        meta = result.info or {}
        return {
            "job_id": job_id,
            "status": "running",
            "progress": meta.get("progress", 0.0),
            "stage": meta.get("stage", "unknown"),
            "message": meta.get("message", ""),
        }

    if result.state == "SUCCESS":
        return {
            "job_id": job_id,
            "status": "completed",
            "progress": 1.0,
            "result": result.result,
        }

    if result.state == "FAILURE":
        return {
            "job_id": job_id,
            "status": "failed",
            "progress": 0.0,
            "error": str(result.info),
        }

    return {"job_id": job_id, "status": result.state, "progress": 0.0}


# ---------------------------------------------------------------------------
# Cancel job
# ---------------------------------------------------------------------------
@router.delete("/{job_id}")
def cancel_job(
    job_id: str,
    _user: dict = Depends(get_current_user),
) -> dict[str, Any]:
    """Cancel a running or queued job."""
    # Remove from sync results if present
    if job_id in _sync_results:
        del _sync_results[job_id]
        return {"job_id": job_id, "cancelled": True}

    if _check_celery_availability():
        _get_celery().control.revoke(job_id, terminate=True)
    return {"job_id": job_id, "cancelled": True}


# ---------------------------------------------------------------------------
# Synchronous training fallbacks (when Celery/Redis unavailable)
# ---------------------------------------------------------------------------
def _run_ml_training_sync(
    dataset_id: str,
    model_type: str,
    horizons: list[int],
    hyperparameters: dict[str, Any],
    auto_tune: bool = False,
    n_trials: int = 50,
) -> dict[str, Any]:
    """Run ML training synchronously (fallback when Celery unavailable)."""
    import time
    import gc
    import numpy as np
    import pandas as pd
    from sklearn.metrics import mean_squared_error, mean_absolute_error

    model_id = str(uuid.uuid4())
    start_time = time.perf_counter()

    from api.services.dataset_store import DatasetStore

    store = DatasetStore()
    entry = store.get(dataset_id)

    # Check if feature engineering was done
    if entry.feature_names is None or entry.train_idx is None:
        raise ValueError("Dataset not prepared. Run feature engineering first.")

    all_metrics: dict[str, dict] = {}

    # Train model for each horizon using sklearn directly (memory efficient)
    for h in horizons:
        target_col = f"Target_{h}"
        if target_col not in entry.df.columns:
            continue

        try:
            # Get feature and target data as DataFrames/Series
            X = entry.df[entry.feature_names]
            y = entry.df[target_col]

            X_train = X.iloc[entry.train_idx]
            y_train = y.iloc[entry.train_idx]
            X_test = X.iloc[entry.test_idx]
            y_test = y.iloc[entry.test_idx]

            if model_type == "xgboost":
                from sklearn.ensemble import GradientBoostingRegressor
                # Use sklearn's GradientBoosting as lightweight XGBoost alternative
                model = GradientBoostingRegressor(
                    n_estimators=hyperparameters.get("n_estimators", 100),
                    max_depth=hyperparameters.get("max_depth", 4),
                    learning_rate=hyperparameters.get("learning_rate", 0.1),
                    random_state=42,
                )
            elif model_type == "random_forest":
                from sklearn.ensemble import RandomForestRegressor
                model = RandomForestRegressor(
                    n_estimators=hyperparameters.get("n_estimators", 100),
                    max_depth=hyperparameters.get("max_depth", 10),
                    random_state=42,
                    n_jobs=1,
                )
            else:
                # Default to GradientBoosting for other types
                from sklearn.ensemble import GradientBoostingRegressor
                model = GradientBoostingRegressor(n_estimators=50, max_depth=3, random_state=42)

            model.fit(X_train, y_train)
            predictions = model.predict(X_test)

            rmse = float(np.sqrt(mean_squared_error(y_test, predictions)))
            mae = float(mean_absolute_error(y_test, predictions))
            mape = float(np.mean(np.abs((y_test - predictions) / np.clip(y_test, 1, None))) * 100)

            all_metrics[f"h{h}"] = {"rmse": rmse, "mae": mae, "mape": mape}

            del model, predictions
            gc.collect()

        except Exception as e:
            all_metrics[f"h{h}"] = {"error": str(e)}

    # Aggregate metrics
    valid_metrics = {k: v for k, v in all_metrics.items() if "error" not in v}
    if valid_metrics:
        avg_rmse = float(np.mean([m.get("rmse", 0) for m in valid_metrics.values()]))
        avg_mae = float(np.mean([m.get("mae", 0) for m in valid_metrics.values()]))
        avg_mape = float(np.mean([m.get("mape", 0) for m in valid_metrics.values()]))
    else:
        avg_rmse = avg_mae = avg_mape = 0.0

    training_time = time.perf_counter() - start_time

    return {
        "status": "completed",
        "model_id": model_id,
        "model_type": model_type,
        "model_name": f"{model_type} (multi-horizon)",
        "metrics": {"rmse": round(avg_rmse, 4), "mae": round(avg_mae, 4), "mape": round(avg_mape, 4)},
        "all_metrics": all_metrics,
        "training_time": round(training_time, 2),
    }


def _run_baseline_training_sync(
    dataset_id: str,
    model_type: str,
    order: list[int] | None = None,
    seasonal_order: list[int] | None = None,
    auto_order: bool = True,
) -> dict[str, Any]:
    """Run baseline (ARIMA/SARIMAX) training synchronously."""
    import time
    import gc
    import numpy as np
    from sklearn.metrics import mean_squared_error, mean_absolute_error

    model_id = str(uuid.uuid4())
    start_time = time.perf_counter()

    from api.services.dataset_store import DatasetStore

    store = DatasetStore()
    entry = store.get(dataset_id)

    # Find ED/target column
    ed_col = None
    for candidate in ["ED", "Total_Arrivals", "patient_count", "Target_1"]:
        if candidate in entry.df.columns:
            ed_col = candidate
            break

    if ed_col is None:
        raise ValueError("No target column (ED) found in dataset. Available columns: " + ", ".join(entry.df.columns[:10].tolist()))

    y = entry.df[ed_col].dropna().values

    # Limit data size for memory efficiency
    if len(y) > 1000:
        y = y[-1000:]

    try:
        if model_type == "arima":
            if auto_order:
                from pmdarima import auto_arima
                auto_model = auto_arima(
                    y,
                    seasonal=False,
                    stepwise=True,
                    suppress_warnings=True,
                    max_p=3, max_q=3, max_d=2,  # Limit search space
                    n_jobs=1,
                )
                fitted = auto_model
                order_used = auto_model.order
            else:
                from statsmodels.tsa.arima.model import ARIMA
                order_tuple = tuple(order) if order else (1, 1, 1)
                model = ARIMA(y, order=order_tuple)
                fitted = model.fit()
                order_used = order_tuple
        else:  # sarimax
            from statsmodels.tsa.statespace.sarimax import SARIMAX
            order_tuple = tuple(order) if order else (1, 1, 1)
            seasonal_tuple = tuple(seasonal_order) if seasonal_order else (1, 0, 1, 7)
            model = SARIMAX(y, order=order_tuple, seasonal_order=seasonal_tuple)
            fitted = model.fit(disp=False, maxiter=100)
            order_used = order_tuple

        y_pred = fitted.fittedvalues if hasattr(fitted, 'fittedvalues') else fitted.predict_in_sample()
        min_len = min(len(y), len(y_pred))
        y_true = y[-min_len:]
        y_pred_aligned = np.array(y_pred[-min_len:])

        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred_aligned)))
        mae = float(mean_absolute_error(y_true, y_pred_aligned))
        mape = float(np.mean(np.abs((y_true - y_pred_aligned) / np.clip(y_true, 1, None))) * 100)

        del fitted
        gc.collect()

        training_time = time.perf_counter() - start_time

        return {
            "status": "completed",
            "model_id": model_id,
            "model_type": model_type,
            "model_name": f"{model_type.upper()} {order_used}",
            "metrics": {"rmse": round(rmse, 4), "mae": round(mae, 4), "mape": round(mape, 4)},
            "training_time": round(training_time, 2),
        }

    except Exception as e:
        gc.collect()
        raise ValueError(f"Training failed: {str(e)}")


# ---------------------------------------------------------------------------
# WebSocket for real-time progress (no auth for simplicity in prototype)
# ---------------------------------------------------------------------------
ws_router = APIRouter()


@ws_router.websocket("/api/ws/jobs/{job_id}")
async def job_progress_ws(websocket: WebSocket, job_id: str):
    """
    WebSocket endpoint for real-time training progress.
    Client connects and receives progress events until job completes.
    """
    await websocket.accept()

    try:
        while True:
            result = _get_celery().AsyncResult(job_id)

            if result.state == "PENDING":
                await websocket.send_json({"status": "queued", "progress": 0.0, "message": "Waiting..."})
            elif result.state == "PROGRESS":
                meta = result.info or {}
                await websocket.send_json({
                    "status": "running",
                    "progress": meta.get("progress", 0.0),
                    "stage": meta.get("stage", ""),
                    "message": meta.get("message", ""),
                })
            elif result.state == "SUCCESS":
                await websocket.send_json({
                    "status": "completed",
                    "progress": 1.0,
                    "result": result.result,
                })
                break
            elif result.state == "FAILURE":
                await websocket.send_json({
                    "status": "failed",
                    "error": str(result.info),
                })
                break

            await asyncio.sleep(1)  # Poll every 1 second

    except WebSocketDisconnect:
        pass
