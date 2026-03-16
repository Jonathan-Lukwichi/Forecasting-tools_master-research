"""
Celery tasks for ML model training.

=== TRIANGULATION RECORD ===
Task: Background ML model training via Celery workers
Approach: Celery tasks with Redis progress tracking, polled via REST or streamed via WebSocket

Vertex 1 (Academic):
  Source: Huyen, C. (2022). "Designing Machine Learning Systems", Ch.7 & 9. O'Reilly.
  Finding: Long-running ML jobs must be decoupled from request-response cycle.
           Workers should report progress, handle failures gracefully, and store artifacts.
  Relevance: Training LSTM/XGBoost can take minutes — must not block API.

Vertex 2 (Industry):
  Source: https://towardsdatascience.com/deploying-ml-models-in-production-with-fastapi-and-celery
  Source: https://celery.school/celery-progress-bars-with-fastapi-htmx
  Pattern: Celery task updates custom state with progress %, FastAPI reads from Redis.
  Adaptation: Using task.update_state(state='PROGRESS', meta={...}) for real-time updates.

Vertex 3 (Internal):
  Files checked: api/routes/models.py (synchronous training logic), api/workers/celery_app.py
  Consistency: Confirmed — extracted same training logic, added progress callbacks.

Verdict: PROCEED
=============================
"""
from __future__ import annotations

import time
import uuid
from typing import Any

from api.workers.celery_app import celery_app


@celery_app.task(bind=True, name="train_ml_model")
def train_ml_model(
    self,
    dataset_id: str,
    model_type: str,
    horizons: list[int],
    hyperparameters: dict[str, Any],
    auto_tune: bool = False,
    n_trials: int = 50,
) -> dict[str, Any]:
    """
    Train an ML model (XGBoost, LSTM, ANN) as a background Celery task.

    Reports progress via self.update_state() which can be polled via
    GET /api/jobs/{task_id} or streamed via WebSocket.
    """
    import numpy as np

    model_id = str(uuid.uuid4())
    start_time = time.perf_counter()

    # Progress: starting
    self.update_state(
        state="PROGRESS",
        meta={"progress": 0.0, "stage": "initializing", "message": f"Starting {model_type} training..."},
    )

    try:
        # Import here to avoid loading heavy deps at worker startup
        from api.services.dataset_store import DatasetStore
        from app_core.services.modeling_service import ModelingService, ModelConfig

        store = DatasetStore()
        entry = store.get(dataset_id)

        if entry.feature_names is None or entry.train_idx is None:
            return {"status": "failed", "error": "Dataset not prepared. Run feature engineering first."}

        svc = ModelingService()
        all_metrics: dict[str, dict] = {}
        total_horizons = len(horizons)

        for i, h in enumerate(horizons):
            target_col = f"Target_{h}"
            progress = (i / total_horizons) * 0.9  # 90% for training, 10% for finalization

            self.update_state(
                state="PROGRESS",
                meta={
                    "progress": round(progress, 2),
                    "stage": "training",
                    "message": f"Training horizon {h}/{total_horizons}...",
                    "current_horizon": h,
                },
            )

            if target_col not in entry.df.columns:
                continue

            y_all = entry.df[target_col].values
            X_all = entry.df[entry.feature_names].values

            X_train = X_all[entry.train_idx]
            y_train = y_all[entry.train_idx]
            X_test = X_all[entry.test_idx]
            y_test = y_all[entry.test_idx]

            X_cal = X_all[entry.cal_idx] if entry.cal_idx is not None else None
            y_cal = y_all[entry.cal_idx] if entry.cal_idx is not None else None

            config = ModelConfig(
                model_type=model_type,
                target_column=target_col,
                horizons=[h],
                hyperparameters=hyperparameters,
                auto_tune=auto_tune,
                n_trials=n_trials,
            )

            result = svc.train_model(X_train, y_train, X_test, y_test, config, X_cal, y_cal)

            if result.success and result.data:
                model_result = result.data
                all_metrics[f"h{h}"] = model_result.metrics
            else:
                all_metrics[f"h{h}"] = {"error": result.error or "Training failed"}

        # Aggregate metrics
        self.update_state(
            state="PROGRESS",
            meta={"progress": 0.95, "stage": "finalizing", "message": "Aggregating metrics..."},
        )

        valid_metrics = {k: v for k, v in all_metrics.items() if "error" not in v}
        if valid_metrics:
            avg_rmse = float(np.mean([m.get("rmse", 0) for m in valid_metrics.values()]))
            avg_mae = float(np.mean([m.get("mae", 0) for m in valid_metrics.values()]))
            avg_mape = float(np.mean([m.get("mape", 0) for m in valid_metrics.values()]))
        else:
            avg_rmse = avg_mae = avg_mape = 0.0

        training_time = time.perf_counter() - start_time

        # Store result
        store.store_model_result(dataset_id, model_id, {
            "model_type": model_type,
            "metrics": {"rmse": avg_rmse, "mae": avg_mae, "mape": avg_mape},
            "all_metrics": all_metrics,
            "training_time": training_time,
        })

        return {
            "status": "completed",
            "model_id": model_id,
            "model_type": model_type,
            "model_name": f"{model_type} (multi-horizon)",
            "metrics": {"rmse": round(avg_rmse, 4), "mae": round(avg_mae, 4), "mape": round(avg_mape, 4)},
            "all_metrics": all_metrics,
            "training_time": round(training_time, 2),
        }

    except Exception as e:
        return {"status": "failed", "error": str(e), "model_type": model_type}


@celery_app.task(bind=True, name="train_baseline_model")
def train_baseline_model(
    self,
    dataset_id: str,
    model_type: str,
    order: list[int] | None = None,
    seasonal_order: list[int] | None = None,
    auto_order: bool = True,
) -> dict[str, Any]:
    """Train ARIMA or SARIMAX baseline model as background task."""
    model_id = str(uuid.uuid4())
    start_time = time.perf_counter()

    self.update_state(
        state="PROGRESS",
        meta={"progress": 0.0, "stage": "initializing", "message": f"Starting {model_type} training..."},
    )

    try:
        from api.services.dataset_store import DatasetStore

        store = DatasetStore()
        entry = store.get(dataset_id)

        # Find ED/target column
        ed_col = None
        for candidate in ["ED", "Total_Arrivals", "patient_count"]:
            if candidate in entry.df.columns:
                ed_col = candidate
                break

        if ed_col is None:
            return {"status": "failed", "error": "No target column (ED) found in dataset"}

        self.update_state(
            state="PROGRESS",
            meta={"progress": 0.2, "stage": "training", "message": f"Fitting {model_type}..."},
        )

        y = entry.df[ed_col].dropna().values

        if model_type == "arima":
            from statsmodels.tsa.arima.model import ARIMA
            if auto_order:
                from pmdarima import auto_arima
                auto_model = auto_arima(y, seasonal=False, stepwise=True, suppress_warnings=True)
                fitted = auto_model
                order_used = auto_model.order
            else:
                order_tuple = tuple(order) if order else (1, 1, 1)
                model = ARIMA(y, order=order_tuple)
                fitted = model.fit()
                order_used = order_tuple
        else:  # sarimax
            from statsmodels.tsa.statespace.sarimax import SARIMAX
            order_tuple = tuple(order) if order else (1, 1, 1)
            seasonal_tuple = tuple(seasonal_order) if seasonal_order else (0, 0, 0, 7)
            model = SARIMAX(y, order=order_tuple, seasonal_order=seasonal_tuple)
            fitted = model.fit(disp=False)
            order_used = order_tuple

        self.update_state(
            state="PROGRESS",
            meta={"progress": 0.8, "stage": "evaluating", "message": "Computing metrics..."},
        )

        import numpy as np
        from sklearn.metrics import mean_squared_error, mean_absolute_error

        y_pred = fitted.fittedvalues if hasattr(fitted, 'fittedvalues') else fitted.predict_in_sample()
        # Align lengths
        min_len = min(len(y), len(y_pred))
        y_true = y[-min_len:]
        y_pred_aligned = np.array(y_pred[-min_len:])

        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred_aligned)))
        mae = float(mean_absolute_error(y_true, y_pred_aligned))
        mape = float(np.mean(np.abs((y_true - y_pred_aligned) / np.clip(y_true, 1, None))) * 100)

        training_time = time.perf_counter() - start_time

        result_data = {
            "model_type": model_type,
            "metrics": {"rmse": round(rmse, 4), "mae": round(mae, 4), "mape": round(mape, 4)},
            "training_time": round(training_time, 2),
        }

        store.store_model_result(dataset_id, model_id, result_data)

        return {
            "status": "completed",
            "model_id": model_id,
            "model_type": model_type,
            "model_name": f"{model_type.upper()} {order_used}",
            "metrics": result_data["metrics"],
            "training_time": result_data["training_time"],
        }

    except Exception as e:
        return {"status": "failed", "error": str(e), "model_type": model_type}
