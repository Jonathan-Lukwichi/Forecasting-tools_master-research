"""
In-memory dataset store.

Holds uploaded/processed DataFrames keyed by dataset_id.
Replace with Redis or DB-backed store in Phase 2 for multi-worker support.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import numpy as np
import pandas as pd


@dataclass
class DatasetEntry:
    dataset_id: str
    df: pd.DataFrame
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    # Optional processed artifacts
    X: np.ndarray | None = None
    y: dict[str, np.ndarray] | None = None
    feature_names: list[str] | None = None
    target_names: list[str] | None = None
    train_idx: np.ndarray | None = None
    cal_idx: np.ndarray | None = None
    test_idx: np.ndarray | None = None

    # Model artifacts
    model_results: dict[str, Any] = field(default_factory=dict)
    forecast_results: dict[str, Any] = field(default_factory=dict)


class DatasetStore:
    """Thread-safe in-memory store for datasets and their artifacts."""

    def __init__(self) -> None:
        self._datasets: dict[str, DatasetEntry] = {}

    def store(
        self,
        df: pd.DataFrame,
        metadata: dict[str, Any] | None = None,
        dataset_id: str | None = None,
    ) -> str:
        dataset_id = dataset_id or str(uuid.uuid4())
        self._datasets[dataset_id] = DatasetEntry(
            dataset_id=dataset_id,
            df=df.copy(),
            metadata=metadata or {},
        )
        return dataset_id

    def get(self, dataset_id: str) -> DatasetEntry:
        entry = self._datasets.get(dataset_id)
        if entry is None:
            raise KeyError(f"Dataset '{dataset_id}' not found")
        return entry

    def update_df(self, dataset_id: str, df: pd.DataFrame) -> None:
        entry = self.get(dataset_id)
        entry.df = df.copy()

    def delete(self, dataset_id: str) -> None:
        self._datasets.pop(dataset_id, None)

    def list_datasets(self) -> list[dict[str, Any]]:
        return [
            {
                "dataset_id": e.dataset_id,
                "rows": len(e.df),
                "columns": list(e.df.columns),
                "created_at": e.created_at.isoformat(),
                "metadata": e.metadata,
            }
            for e in self._datasets.values()
        ]

    def store_model_result(
        self, dataset_id: str, model_id: str, result: dict[str, Any]
    ) -> None:
        entry = self.get(dataset_id)
        entry.model_results[model_id] = result

    def store_forecast(
        self, dataset_id: str, forecast_id: str, result: dict[str, Any]
    ) -> None:
        entry = self.get(dataset_id)
        entry.forecast_results[forecast_id] = result
