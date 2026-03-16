"""
Staff and inventory optimization endpoints.

Wraps existing MILP solvers from app_core/optimization/.
"""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import get_current_user, get_dataset_store
from api.schemas.optimization import (
    InventoryOptimizeRequest,
    InventoryOptimizeResponse,
    StaffOptimizeRequest,
    StaffOptimizeResponse,
)
from api.services.dataset_store import DatasetStore

router = APIRouter(prefix="/optimize", tags=["Optimization"])


# ---------------------------------------------------------------------------
# Staff Scheduling
# ---------------------------------------------------------------------------
@router.post("/staff", response_model=StaffOptimizeResponse)
def optimize_staff(
    body: StaffOptimizeRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    from app_core.optimization.milp_solver import StaffSchedulingMILP
    from app_core.optimization.cost_parameters import CostParameters

    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    # Build cost parameters
    cost_params = CostParameters(
        overtime_multiplier=body.overtime_multiplier,
        understaffing_penalty=body.understaffing_penalty,
        overstaffing_penalty=body.overstaffing_penalty,
    )
    if body.hourly_rates:
        cost_params.hourly_rates = body.hourly_rates

    # Build demand from forecast or dataset
    demand_df = entry.df

    solver = StaffSchedulingMILP(
        demand=demand_df,
        cost_params=cost_params,
        planning_horizon=body.planning_horizon,
        shift_hours=body.shift_hours,
        min_staff=body.min_staff_per_shift,
        max_overtime=body.max_overtime_hours,
    )

    result = solver.solve()

    def _df_to_records(df) -> list[dict[str, Any]]:
        if df is None:
            return []
        return df.replace({float("nan"): None}).to_dict(orient="records")

    return StaffOptimizeResponse(
        status=result.status,
        is_optimal=result.is_optimal,
        solve_time=round(result.solve_time, 3),
        total_cost=round(result.total_cost, 2),
        regular_labor_cost=round(result.regular_labor_cost, 2),
        overtime_cost=round(result.overtime_cost, 2),
        understaffing_penalty=round(result.understaffing_penalty, 2),
        overstaffing_penalty=round(result.overstaffing_penalty, 2),
        staff_schedule=_df_to_records(result.staff_schedule),
        overtime_schedule=_df_to_records(result.overtime_schedule),
        daily_summary=_df_to_records(result.daily_summary),
        category_coverage=_df_to_records(result.category_coverage),
        num_variables=result.num_variables,
        num_constraints=result.num_constraints,
    )


# ---------------------------------------------------------------------------
# Inventory Optimization
# ---------------------------------------------------------------------------
@router.post("/inventory", response_model=InventoryOptimizeResponse)
def optimize_inventory(
    body: InventoryOptimizeRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    from app_core.optimization.inventory_optimizer import (
        InventoryOptimizer,
        HealthcareInventoryItem,
        ItemCriticality,
    )

    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    # Convert API items to domain objects
    items = []
    for item in body.items:
        items.append(HealthcareInventoryItem(
            item_id=item.item_id,
            name=item.name,
            category=item.category,
            unit_cost=item.unit_cost,
            holding_cost_rate=item.holding_cost_rate,
            ordering_cost=item.ordering_cost,
            stockout_penalty=item.stockout_penalty,
            lead_time=item.lead_time,
            usage_rate=item.usage_rate,
            min_order_qty=item.min_order_qty,
            max_order_qty=item.max_order_qty,
            shelf_life=item.shelf_life,
            criticality=ItemCriticality[item.criticality],
        ))

    optimizer = InventoryOptimizer(
        items=items,
        demand=entry.df,
        planning_horizon=body.planning_horizon,
        storage_capacity=body.storage_capacity,
        daily_budget=body.daily_budget,
    )

    result = optimizer.solve()

    def _df_to_records(df) -> list[dict[str, Any]]:
        if df is None:
            return []
        return df.replace({float("nan"): None}).to_dict(orient="records")

    return InventoryOptimizeResponse(
        status=result.status,
        is_optimal=result.is_optimal,
        solve_time=round(result.solve_time, 3),
        total_cost=round(result.total_cost, 2),
        ordering_cost=round(result.ordering_cost, 2),
        holding_cost=round(result.holding_cost, 2),
        stockout_cost=round(result.stockout_cost, 2),
        order_schedule=_df_to_records(result.order_schedule),
        inventory_levels=_df_to_records(result.inventory_levels),
        reorder_alerts=_df_to_records(result.reorder_alerts),
        service_level=round(result.service_level, 4),
    )
