"""
Model training, results, and forecast schemas.
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------
class TrainRequest(BaseModel):
    dataset_id: str
    model_type: str  # xgboost, lstm, ann, hybrid_lstm_xgb, hybrid_lstm_sarimax, hybrid_lstm_ann
    horizons: list[int] = [1, 2, 3, 4, 5, 6, 7]
    hyperparameters: dict[str, Any] = {}
    auto_tune: bool = False
    n_trials: int = 50
    use_seasonal_proportions: bool = False


class TrainBaselineRequest(BaseModel):
    dataset_id: str
    model_type: str  # arima, sarimax
    order: tuple[int, int, int] | None = None
    seasonal_order: tuple[int, int, int, int] | None = None
    auto_order: bool = True
    use_seasonal_proportions: bool = False


class TrainResponse(BaseModel):
    model_id: str
    model_type: str
    model_name: str
    metrics: dict[str, float]  # RMSE, MAE, MAPE
    training_time: float
    feature_importances: dict[str, float] | None = None
    status: str = "completed"


class TrainProgressEvent(BaseModel):
    """Sent via WebSocket during training."""
    model_id: str
    progress: float  # 0.0 - 1.0
    message: str
    stage: str  # "preprocessing", "training", "evaluating", "complete"


# ---------------------------------------------------------------------------
# Model Comparison
# ---------------------------------------------------------------------------
class ModelComparisonResponse(BaseModel):
    best_model: str
    ranking: list[dict[str, Any]]  # [{model, rmse, mae, mape, rank}]
    metric_used: str


# ---------------------------------------------------------------------------
# Forecast
# ---------------------------------------------------------------------------
class ForecastRequest(BaseModel):
    dataset_id: str
    model_id: str
    horizons: list[int] = [1, 2, 3, 4, 5, 6, 7]
    include_intervals: bool = True
    confidence_level: float = 0.9


class ForecastResponse(BaseModel):
    forecast_id: str
    model_name: str
    horizons: list[int]
    predictions: list[dict[str, Any]]  # [{date, horizon, forecast, lower, upper, categories}]
    category_breakdown: list[dict[str, Any]] | None = None
