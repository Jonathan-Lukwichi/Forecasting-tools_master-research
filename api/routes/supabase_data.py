"""
Supabase data-loading endpoints.

Allows the frontend to browse and load datasets directly from Supabase
into the in-memory DatasetStore, eliminating the need for manual CSV uploads
when the data already lives in the database.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import get_current_user, get_dataset_store
from api.schemas.supabase import (
    SupabaseLoadAllRequest,
    SupabaseLoadAllResponse,
    SupabaseLoadRequest,
    SupabaseLoadResponse,
    SupabaseTablesResponse,
)
from api.services.dataset_store import DatasetStore
from api.services.supabase_service import (
    SUPABASE_TABLES,
    fetch_table,
    is_connected,
    list_available_tables,
)

router = APIRouter(prefix="/data/supabase", tags=["Supabase Data"])


# ---------------------------------------------------------------------------
# List available tables
# ---------------------------------------------------------------------------
@router.get("/tables", response_model=SupabaseTablesResponse)
def get_tables(
    _user: dict = Depends(get_current_user),
):
    """List all available Supabase tables with row counts."""
    return SupabaseTablesResponse(
        connected=is_connected(),
        tables=list_available_tables(),
    )


# ---------------------------------------------------------------------------
# Load a single table into the DatasetStore
# ---------------------------------------------------------------------------
@router.post("/load", response_model=SupabaseLoadResponse)
def load_table(
    body: SupabaseLoadRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    """Fetch a Supabase table and store it in the in-memory DatasetStore."""
    if body.table_name not in SUPABASE_TABLES:
        raise HTTPException(
            400,
            f"Unknown table '{body.table_name}'. "
            f"Available: {list(SUPABASE_TABLES.keys())}",
        )

    if not is_connected():
        raise HTTPException(
            503,
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY in .env",
        )

    meta = SUPABASE_TABLES[body.table_name]
    df = fetch_table(
        body.table_name,
        order_by=meta.get("order_by"),
        limit=body.limit,
    )

    if df.empty:
        raise HTTPException(
            404,
            f"Table '{body.table_name}' returned no data. "
            "Check that the table exists and has rows in Supabase.",
        )

    dataset_id = store.store(
        df,
        metadata={
            "type": meta["dataset_type"],
            "source": "supabase",
            "table_name": body.table_name,
            "label": meta["label"],
        },
    )

    preview = df.head(5).replace({float("nan"): None}).to_dict(orient="records")

    return SupabaseLoadResponse(
        dataset_id=dataset_id,
        table_name=body.table_name,
        label=meta["label"],
        dataset_type=meta["dataset_type"],
        rows=len(df),
        columns=list(df.columns),
        preview=preview,
    )


# ---------------------------------------------------------------------------
# Load multiple tables at once
# ---------------------------------------------------------------------------
@router.post("/load-all", response_model=SupabaseLoadAllResponse)
def load_multiple_tables(
    body: SupabaseLoadAllRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    """Load multiple Supabase tables in one request (e.g. patient + weather + calendar)."""
    if not is_connected():
        raise HTTPException(
            503,
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY in .env",
        )

    datasets: list[SupabaseLoadResponse] = []
    errors: list[str] = []

    for table_name in body.tables:
        if table_name not in SUPABASE_TABLES:
            errors.append(f"Unknown table: {table_name}")
            continue

        meta = SUPABASE_TABLES[table_name]
        try:
            df = fetch_table(table_name, order_by=meta.get("order_by"))

            if df.empty:
                errors.append(f"{table_name}: no data returned")
                continue

            dataset_id = store.store(
                df,
                metadata={
                    "type": meta["dataset_type"],
                    "source": "supabase",
                    "table_name": table_name,
                    "label": meta["label"],
                },
            )

            preview = df.head(5).replace({float("nan"): None}).to_dict(orient="records")

            datasets.append(
                SupabaseLoadResponse(
                    dataset_id=dataset_id,
                    table_name=table_name,
                    label=meta["label"],
                    dataset_type=meta["dataset_type"],
                    rows=len(df),
                    columns=list(df.columns),
                    preview=preview,
                )
            )
        except Exception as exc:
            errors.append(f"{table_name}: {exc}")

    return SupabaseLoadAllResponse(datasets=datasets, errors=errors)
