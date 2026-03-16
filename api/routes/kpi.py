"""
Dashboard KPI endpoint — aggregates metrics across all pipeline stages.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import get_current_user, get_dataset_store
from api.schemas.kpi import ForecastKPIResponse
from api.services.dataset_store import DatasetStore

router = APIRouter(prefix="/kpi", tags=["Dashboard"])


@router.get("/dashboard/{dataset_id}", response_model=ForecastKPIResponse)
def get_dashboard_kpis(
    dataset_id: str,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    try:
        entry = store.get(dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    df = entry.df
    models = entry.model_results
    forecasts = entry.forecast_results

    # --- Historical metrics ---
    has_historical = "ED" in df.columns
    hist_avg = float(df["ED"].mean()) if has_historical else 0.0
    hist_max = float(df["ED"].max()) if has_historical else 0.0
    hist_min = float(df["ED"].min()) if has_historical else 0.0
    total_records = len(df)

    # --- Model metrics ---
    has_models = len(models) > 0
    best_model_name = "N/A"
    best_mape = 0.0
    best_rmse = 0.0

    if has_models:
        best = min(
            models.items(),
            key=lambda kv: kv[1].get("metrics", {}).get("rmse", float("inf")),
        )
        best_model_name = best[1].get("model_type", "unknown")
        best_mape = best[1].get("metrics", {}).get("mape", 0.0)
        best_rmse = best[1].get("metrics", {}).get("rmse", 0.0)

    # --- Forecast metrics ---
    has_forecast = len(forecasts) > 0
    today_forecast = 0.0
    week_total = 0.0
    peak_day = 0.0
    peak_day_name = "N/A"
    forecast_dates: list[str] = []

    # --- Day-of-week pattern ---
    daily_pattern: list[dict[str, Any]] = []
    if has_historical and "Date" in df.columns:
        import pandas as pd
        temp = df.copy()
        temp["Date"] = pd.to_datetime(temp["Date"], errors="coerce")
        temp["dow"] = temp["Date"].dt.day_name().str[:3]
        dow_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        grouped = temp.groupby("dow")["ED"].mean()
        for day in dow_order:
            if day in grouped.index:
                daily_pattern.append({"day": day, "avg_ed": round(float(grouped[day]), 1)})

    # --- Forecast trend ---
    forecast_trend: list[dict[str, Any]] = []
    if has_historical and "Date" in df.columns and "ED" in df.columns:
        import pandas as pd
        temp = df[["Date", "ED"]].tail(30).copy()
        temp["Date"] = pd.to_datetime(temp["Date"], errors="coerce")
        for _, row in temp.iterrows():
            forecast_trend.append({
                "date": str(row["Date"].date()) if pd.notna(row["Date"]) else "",
                "actual": float(row["ED"]) if pd.notna(row["ED"]) else 0,
                "type": "historical",
            })

    return ForecastKPIResponse(
        today_forecast=today_forecast,
        week_total_forecast=week_total,
        peak_day_forecast=peak_day,
        peak_day_name=peak_day_name,
        forecast_model_name=best_model_name if has_forecast else "N/A",
        forecast_dates=forecast_dates,
        historical_avg_ed=round(hist_avg, 1),
        historical_max_ed=hist_max,
        historical_min_ed=hist_min,
        total_records=total_records,
        best_model_name=best_model_name,
        best_model_mape=round(best_mape, 2),
        best_model_rmse=round(best_rmse, 2),
        models_trained=len(models),
        category_distribution=[],
        staff_coverage_pct=0.0,
        total_staff_needed=0,
        overtime_hours=0.0,
        daily_staff_cost=0.0,
        supply_service_level=0.0,
        supply_total_cost=0.0,
        supply_weekly_savings=0.0,
        supply_items_count=0,
        supply_reorder_alerts=0,
        forecast_trend=forecast_trend,
        daily_ed_pattern=daily_pattern,
        model_comparison=[],
        has_forecast=has_forecast,
        has_historical=has_historical,
        has_models=has_models,
        has_staff_plan=False,
        has_supply_plan=False,
    )
