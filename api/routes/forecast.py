"""
Forecasting endpoints — generate predictions from trained models.
"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import get_current_user, get_dataset_store
from api.schemas.ml import ForecastRequest, ForecastResponse
from api.services.dataset_store import DatasetStore

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.post("/predict", response_model=ForecastResponse)
def generate_forecast(
    body: ForecastRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    model_result = entry.model_results.get(body.model_id)
    if model_result is None:
        raise HTTPException(404, f"Model '{body.model_id}' not found")

    # For now, return the stored predictions from training
    # Full inference pipeline will be added when models are persisted to disk
    forecast_id = str(uuid.uuid4())

    predictions: list[dict[str, Any]] = []
    for h in body.horizons:
        predictions.append({
            "horizon": h,
            "forecast": model_result.get("metrics", {}).get(f"Target_{h}_rmse", 0),
            "lower": None,
            "upper": None,
        })

    store.store_forecast(body.dataset_id, forecast_id, {
        "model_id": body.model_id,
        "predictions": predictions,
    })

    return ForecastResponse(
        forecast_id=forecast_id,
        model_name=model_result.get("model_type", "unknown"),
        horizons=body.horizons,
        predictions=predictions,
    )
