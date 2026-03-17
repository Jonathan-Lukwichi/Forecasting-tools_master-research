"""
Pydantic schemas for Supabase data-loading endpoints.
"""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class SupabaseTableInfo(BaseModel):
    """Metadata for a single Supabase table."""

    table_name: str
    label: str
    description: str
    dataset_type: str
    row_count: int
    available: bool


class SupabaseTablesResponse(BaseModel):
    """Response for listing available Supabase tables."""

    connected: bool
    tables: list[SupabaseTableInfo]


class SupabaseLoadRequest(BaseModel):
    """Request to load a table from Supabase into the DatasetStore."""

    table_name: str
    limit: int | None = None  # Optional row limit


class SupabaseLoadResponse(BaseModel):
    """Response after loading a Supabase table."""

    dataset_id: str
    table_name: str
    label: str
    dataset_type: str
    rows: int
    columns: list[str]
    preview: list[dict[str, Any]]


class SupabaseLoadAllRequest(BaseModel):
    """Request to load multiple tables at once."""

    tables: list[str]  # e.g. ["patient_arrivals", "weather_data", "calendar_data"]


class SupabaseLoadAllResponse(BaseModel):
    """Response after loading multiple tables."""

    datasets: list[SupabaseLoadResponse]
    errors: list[str]
