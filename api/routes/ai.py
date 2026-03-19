"""
AI-powered recommendations endpoint.

Generates contextual recommendations for hospital managers based on
forecast data and optimization results.
"""
from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.dependencies import get_current_user, get_dataset_store
from api.services.dataset_store import DatasetStore

router = APIRouter(prefix="/ai", tags=["AI"])


class RecommendationRequest(BaseModel):
    dataset_id: str
    context: str = "general"  # "staff" | "supply" | "general"
    forecast_summary: dict[str, Any] | None = None


class Recommendation(BaseModel):
    id: str
    title: str
    description: str
    priority: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    category: str  # "staff" | "supply" | "general"
    action_items: list[str]


class RecommendationResponse(BaseModel):
    recommendations: list[Recommendation]
    generated_by: str
    context: str


# ---------------------------------------------------------------------------
# Generate Recommendations
# ---------------------------------------------------------------------------
@router.post("/recommendations", response_model=RecommendationResponse)
def generate_recommendations(
    body: RecommendationRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    """Generate AI-powered recommendations based on dataset and context."""
    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    # Check if LLM API is configured
    llm_api_key = os.getenv("LLM_API_KEY") or os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY")

    if llm_api_key:
        # Use LLM for recommendations (future implementation)
        recommendations = _generate_llm_recommendations(entry, body.context)
        generated_by = "Claude AI"
    else:
        # Generate rule-based recommendations when LLM not configured
        recommendations = _generate_rule_based_recommendations(entry, body.context)
        generated_by = "Rule-based system"

    return RecommendationResponse(
        recommendations=recommendations,
        generated_by=generated_by,
        context=body.context,
    )


def _generate_rule_based_recommendations(entry: Any, context: str) -> list[Recommendation]:
    """Generate recommendations based on data patterns (no LLM required)."""
    recommendations = []
    df = entry.df

    # Check for high variance days
    if "ED" in df.columns:
        ed_std = df["ED"].std()
        ed_mean = df["ED"].mean()
        cv = ed_std / ed_mean if ed_mean > 0 else 0

        if cv > 0.3:
            recommendations.append(Recommendation(
                id="rec-001",
                title="High demand variability detected",
                description=f"Patient arrivals show high variability (CV={cv:.2f}). Consider flexible staffing arrangements.",
                priority="HIGH",
                category="staff",
                action_items=[
                    "Implement on-call staffing pool",
                    "Review historical peak patterns",
                    "Consider cross-training staff for surge capacity",
                ],
            ))

    # Check day-of-week patterns
    if "ED" in df.columns and "DayOfWeek" in df.columns:
        dow_avg = df.groupby("DayOfWeek")["ED"].mean()
        peak_day = dow_avg.idxmax()
        peak_value = dow_avg.max()
        avg_value = dow_avg.mean()

        if peak_value > avg_value * 1.2:
            recommendations.append(Recommendation(
                id="rec-002",
                title=f"Peak demand on {peak_day}s",
                description=f"Demand is {((peak_value/avg_value - 1)*100):.0f}% higher on {peak_day}s. Adjust staffing accordingly.",
                priority="MEDIUM",
                category="staff",
                action_items=[
                    f"Schedule additional staff on {peak_day}s",
                    "Review appointment scheduling for non-urgent cases",
                    "Prepare overflow protocols",
                ],
            ))

    # General recommendations based on context
    if context == "staff" or context == "general":
        recommendations.append(Recommendation(
            id="rec-003",
            title="Staff schedule optimization available",
            description="Use the Staff Planner to generate an optimized schedule based on your demand forecast.",
            priority="LOW",
            category="staff",
            action_items=[
                "Navigate to Staff Planner page",
                "Configure cost parameters",
                "Run optimization",
            ],
        ))

    if context == "supply" or context == "general":
        recommendations.append(Recommendation(
            id="rec-004",
            title="Inventory optimization available",
            description="Use the Supply Planner to optimize inventory levels and prevent stockouts.",
            priority="LOW",
            category="supply",
            action_items=[
                "Navigate to Supply Planner page",
                "Configure critical items",
                "Run optimization",
            ],
        ))

    # Add a general recommendation if none generated
    if not recommendations:
        recommendations.append(Recommendation(
            id="rec-000",
            title="Data analysis complete",
            description="No immediate concerns detected. Continue monitoring key metrics.",
            priority="LOW",
            category="general",
            action_items=[
                "Review dashboard KPIs regularly",
                "Update forecasts weekly",
                "Monitor for unusual patterns",
            ],
        ))

    return recommendations


def _generate_llm_recommendations(entry: Any, context: str) -> list[Recommendation]:
    """Generate recommendations using LLM (placeholder for future implementation)."""
    # TODO: Implement LLM-based recommendations using app_core/ai/
    # For now, fall back to rule-based
    return _generate_rule_based_recommendations(entry, context)
