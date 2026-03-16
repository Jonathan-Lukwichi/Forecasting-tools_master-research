"""
Staff and inventory optimization schemas.
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Staff Optimization
# ---------------------------------------------------------------------------
class StaffOptimizeRequest(BaseModel):
    dataset_id: str
    forecast_id: str | None = None
    planning_horizon: int = 10  # days
    # Cost parameters
    hourly_rates: dict[str, float] | None = None  # {role: rate}
    overtime_multiplier: float = 1.5
    understaffing_penalty: float = 500.0
    overstaffing_penalty: float = 100.0
    # Constraints
    min_staff_per_shift: int = 2
    max_overtime_hours: float = 4.0
    shift_hours: float = 8.0


class StaffOptimizeResponse(BaseModel):
    status: str  # "Optimal", "Feasible", "Infeasible"
    is_optimal: bool
    solve_time: float
    # Costs
    total_cost: float
    regular_labor_cost: float
    overtime_cost: float
    understaffing_penalty: float
    overstaffing_penalty: float
    # Schedules (JSON-serialized DataFrames)
    staff_schedule: list[dict[str, Any]]
    overtime_schedule: list[dict[str, Any]]
    daily_summary: list[dict[str, Any]]
    category_coverage: list[dict[str, Any]]
    # Model info
    num_variables: int
    num_constraints: int


# ---------------------------------------------------------------------------
# Inventory Optimization
# ---------------------------------------------------------------------------
class InventoryItem(BaseModel):
    item_id: str
    name: str
    category: str
    unit_cost: float
    holding_cost_rate: float = 0.20
    ordering_cost: float = 50.0
    stockout_penalty: float = 100.0
    lead_time: int = 3
    usage_rate: float = 1.0
    min_order_qty: int = 1
    max_order_qty: int = 10000
    shelf_life: int | None = None
    criticality: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL


class InventoryOptimizeRequest(BaseModel):
    dataset_id: str
    forecast_id: str | None = None
    items: list[InventoryItem]
    planning_horizon: int = 10
    storage_capacity: float = 100.0  # cubic meters
    daily_budget: float = 10000.0


class InventoryOptimizeResponse(BaseModel):
    status: str
    is_optimal: bool
    solve_time: float
    total_cost: float
    ordering_cost: float
    holding_cost: float
    stockout_cost: float
    order_schedule: list[dict[str, Any]]
    inventory_levels: list[dict[str, Any]]
    reorder_alerts: list[dict[str, Any]]
    service_level: float
