"""
Dashboard KPI response schemas.
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ForecastKPIResponse(BaseModel):
    # Forecast
    today_forecast: float
    week_total_forecast: float
    peak_day_forecast: float
    peak_day_name: str
    forecast_model_name: str
    forecast_dates: list[str]

    # Historical
    historical_avg_ed: float
    historical_max_ed: float
    historical_min_ed: float
    total_records: int

    # Model performance
    best_model_name: str
    best_model_mape: float
    best_model_rmse: float
    models_trained: int

    # Categories
    category_distribution: list[dict[str, Any]]

    # Staff planning
    staff_coverage_pct: float
    total_staff_needed: int
    overtime_hours: float
    daily_staff_cost: float

    # Supply planning
    supply_service_level: float
    supply_total_cost: float
    supply_weekly_savings: float
    supply_items_count: int
    supply_reorder_alerts: int

    # Time series for charts
    forecast_trend: list[dict[str, Any]]
    daily_ed_pattern: list[dict[str, Any]]
    model_comparison: list[dict[str, Any]]

    # Availability flags
    has_forecast: bool
    has_historical: bool
    has_models: bool
    has_staff_plan: bool
    has_supply_plan: bool
