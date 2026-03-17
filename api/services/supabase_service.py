"""
Supabase client for FastAPI — loads credentials from environment variables.

Replaces the Streamlit-dependent app_core/data/supabase_client.py for the
new decoupled architecture. All Supabase access in the API layer goes
through this module.
"""
from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any

import pandas as pd

logger = logging.getLogger(__name__)

# Available Supabase tables and their metadata
SUPABASE_TABLES: dict[str, dict[str, Any]] = {
    "patient_arrivals": {
        "label": "Patient Arrivals",
        "description": "Daily emergency department patient counts by hospital",
        "dataset_type": "patient",
        "date_column": "datetime",
        "order_by": "datetime",
    },
    "weather_data": {
        "label": "Weather Data",
        "description": "Daily weather observations (temperature, precipitation, humidity)",
        "dataset_type": "weather",
        "date_column": "datetime",
        "order_by": "datetime",
    },
    "calendar_data": {
        "label": "Calendar Data",
        "description": "Calendar features (holidays, day of week, special events)",
        "dataset_type": "calendar",
        "date_column": "date",
        "order_by": "date",
    },
    "clinical_visits": {
        "label": "Clinical Visits",
        "description": "Visit reasons by clinical category (respiratory, cardiac, trauma, etc.)",
        "dataset_type": "reason",
        "date_column": "datetime",
        "order_by": "datetime",
    },
    "staff_scheduling": {
        "label": "Staff Scheduling",
        "description": "Historical staff allocation (doctors, nurses, overtime hours)",
        "dataset_type": "staff",
        "date_column": "date",
        "order_by": "date",
    },
    "inventory_management": {
        "label": "Inventory Management",
        "description": "Supply inventory levels, usage rates, and stockout risk scores",
        "dataset_type": "inventory",
        "date_column": "Date",
        "order_by": "Date",
    },
    "financial_data": {
        "label": "Financial Data",
        "description": "Hospital financial records (labor costs, inventory costs, revenue)",
        "dataset_type": "financial",
        "date_column": "Date",
        "order_by": "Date",
    },
}


@lru_cache
def _get_supabase_client():
    """
    Create and cache a Supabase client using env-based settings.

    Returns None if credentials are not configured.
    """
    from api.config import get_settings

    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        logger.warning("Supabase credentials not configured (SUPABASE_URL / SUPABASE_KEY)")
        return None

    try:
        from supabase import create_client

        client = create_client(settings.supabase_url, settings.supabase_key)
        logger.info("Supabase client initialised for %s", settings.supabase_url)
        return client
    except ImportError:
        logger.error("supabase package not installed — run: pip install supabase")
        return None
    except Exception as exc:
        logger.error("Failed to create Supabase client: %s", exc)
        return None


def get_supabase_client():
    """Public accessor — returns the cached client or None."""
    return _get_supabase_client()


def is_connected() -> bool:
    """Check if Supabase is reachable."""
    return get_supabase_client() is not None


def fetch_table(
    table_name: str,
    order_by: str | None = None,
    ascending: bool = True,
    limit: int | None = None,
) -> pd.DataFrame:
    """
    Fetch all rows from a Supabase table (handles the 1000-row pagination limit).

    Args:
        table_name: Supabase table name.
        order_by: Column to sort by.
        ascending: Sort direction.
        limit: Optional max rows to fetch.

    Returns:
        DataFrame with the table data, or empty DataFrame on failure.
    """
    client = get_supabase_client()
    if client is None:
        return pd.DataFrame()

    all_data: list[dict] = []
    batch_size = 1000
    offset = 0

    try:
        while True:
            query = client.table(table_name).select("*")

            if order_by:
                query = query.order(order_by, desc=not ascending)

            query = query.range(offset, offset + batch_size - 1)
            response = query.execute()

            if response.data:
                all_data.extend(response.data)
                if len(response.data) < batch_size:
                    break
                offset += batch_size
                if limit and len(all_data) >= limit:
                    all_data = all_data[:limit]
                    break
            else:
                break

        if all_data:
            df = pd.DataFrame(all_data)
            # Drop Supabase internal columns if present
            for col in ("id", "created_at", "updated_at"):
                if col in df.columns and col not in ("Date", "date", "datetime"):
                    # Only drop 'id' if it looks like a Supabase auto-id (int/uuid)
                    if col == "id" and df[col].dtype == "object":
                        continue
                    # Keep created_at/updated_at — they might be useful
            return df

        return pd.DataFrame()

    except Exception as exc:
        logger.error("Error fetching table '%s': %s", table_name, exc)
        return pd.DataFrame()


def fetch_table_row_count(table_name: str) -> int:
    """Get the approximate row count for a table."""
    client = get_supabase_client()
    if client is None:
        return 0

    try:
        response = client.table(table_name).select("*", count="exact").limit(1).execute()
        return response.count or 0
    except Exception:
        return 0


def list_available_tables() -> list[dict[str, Any]]:
    """
    List all known Supabase tables with metadata and row counts.

    Returns a list of dicts suitable for the frontend table picker.
    """
    client = get_supabase_client()
    tables = []

    for table_name, meta in SUPABASE_TABLES.items():
        row_count = 0
        available = False

        if client is not None:
            try:
                response = (
                    client.table(table_name)
                    .select("*", count="exact")
                    .limit(1)
                    .execute()
                )
                row_count = response.count or 0
                available = True
            except Exception:
                available = False

        tables.append(
            {
                "table_name": table_name,
                "label": meta["label"],
                "description": meta["description"],
                "dataset_type": meta["dataset_type"],
                "row_count": row_count,
                "available": available,
            }
        )

    return tables
