"""
Feature selection endpoint.

Provides multiple feature selection methods:
- Correlation-based (baseline)
- Permutation importance
- Lasso regularization
- Gradient Boosting importance

Memory-optimized for Render free tier (512MB limit).
"""
from __future__ import annotations

import gc
import time
from typing import Any

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.dependencies import get_current_user, get_dataset_store
from api.services.dataset_store import DatasetStore

router = APIRouter(prefix="/features", tags=["Features"])


class FeatureSelectionRequest(BaseModel):
    dataset_id: str
    target_column: str = "ED"
    method: str = "all"  # "correlation" | "permutation" | "lasso" | "gradient_boosting" | "all"
    top_k: int = 20
    test_size: float = 0.2


class FeatureImportance(BaseModel):
    feature: str
    importance: float
    rank: int


class FeatureSelectionResult(BaseModel):
    method: str
    selected_features: list[str]
    importances: list[FeatureImportance]
    metrics: dict[str, float]
    elapsed_time: float


class FeatureSelectionResponse(BaseModel):
    dataset_id: str
    target_column: str
    total_features: int
    results: list[FeatureSelectionResult]


@router.post("/select", response_model=FeatureSelectionResponse)
def select_features(
    body: FeatureSelectionRequest,
    _user: dict = Depends(get_current_user),
    store: DatasetStore = Depends(get_dataset_store),
):
    """Run feature selection algorithms on the dataset."""
    try:
        entry = store.get(body.dataset_id)
    except KeyError:
        raise HTTPException(404, "Dataset not found")

    df = entry.df

    # Find target column
    target_col = body.target_column
    if target_col not in df.columns:
        # Try alternatives
        for alt in ["ED", "Total_Arrivals", "patient_count", "Target_1"]:
            if alt in df.columns:
                target_col = alt
                break
        else:
            raise HTTPException(422, f"Target column '{body.target_column}' not found")

    # Get numeric feature columns (exclude target and date columns)
    exclude_cols = {target_col, "Date", "date", "datetime", "index"}
    feature_cols = [
        c for c in df.select_dtypes(include=[np.number]).columns
        if c not in exclude_cols and not c.startswith("Target_")
    ]

    if len(feature_cols) == 0:
        raise HTTPException(422, "No numeric features found for selection")

    X = df[feature_cols].dropna()
    y = df.loc[X.index, target_col]

    results = []
    methods_to_run = (
        ["correlation", "permutation", "lasso", "gradient_boosting"]
        if body.method == "all"
        else [body.method]
    )

    for method in methods_to_run:
        try:
            result = _run_feature_selection(X, y, method, body.top_k, body.test_size)
            results.append(result)
        except Exception as e:
            # Log error but continue with other methods
            results.append(FeatureSelectionResult(
                method=method,
                selected_features=[],
                importances=[],
                metrics={"error": 1.0},
                elapsed_time=0.0,
            ))
        # Memory cleanup after each method
        gc.collect()

    return FeatureSelectionResponse(
        dataset_id=body.dataset_id,
        target_column=target_col,
        total_features=len(feature_cols),
        results=results,
    )


def _run_feature_selection(
    X: pd.DataFrame,
    y: pd.Series,
    method: str,
    top_k: int,
    test_size: float,
) -> FeatureSelectionResult:
    """Run a single feature selection method."""
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import mean_squared_error, mean_absolute_error

    t0 = time.perf_counter()

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train),
        columns=X_train.columns,
        index=X_train.index,
    )
    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test),
        columns=X_test.columns,
        index=X_test.index,
    )

    if method == "correlation":
        importances = _correlation_importance(X_train_scaled, y_train)
    elif method == "permutation":
        importances = _permutation_importance(X_train_scaled, X_test_scaled, y_train, y_test)
    elif method == "lasso":
        importances = _lasso_importance(X_train_scaled, y_train)
    elif method == "gradient_boosting":
        importances = _gradient_boosting_importance(X_train_scaled, y_train)
    else:
        raise ValueError(f"Unknown method: {method}")

    # Sort by importance and select top_k
    sorted_features = sorted(importances.items(), key=lambda x: abs(x[1]), reverse=True)
    selected = [f for f, _ in sorted_features[:top_k]]

    # Calculate metrics using selected features (memory-optimized)
    from sklearn.ensemble import GradientBoostingRegressor
    model = GradientBoostingRegressor(n_estimators=30, max_depth=3, random_state=42)
    model.fit(X_train_scaled[selected], y_train)

    y_train_pred = model.predict(X_train_scaled[selected])
    y_test_pred = model.predict(X_test_scaled[selected])

    rmse_train = float(np.sqrt(mean_squared_error(y_train, y_train_pred)))
    rmse_test = float(np.sqrt(mean_squared_error(y_test, y_test_pred)))
    mae_test = float(mean_absolute_error(y_test, y_test_pred))

    elapsed = time.perf_counter() - t0

    # Memory cleanup
    del model, X_train_scaled, X_test_scaled, y_train_pred, y_test_pred

    return FeatureSelectionResult(
        method=method,
        selected_features=selected,
        importances=[
            FeatureImportance(feature=f, importance=round(imp, 4), rank=i + 1)
            for i, (f, imp) in enumerate(sorted_features[:top_k])
        ],
        metrics={
            "rmse_train": round(rmse_train, 4),
            "rmse_test": round(rmse_test, 4),
            "mae_test": round(mae_test, 4),
        },
        elapsed_time=round(elapsed, 2),
    )


def _correlation_importance(X: pd.DataFrame, y: pd.Series) -> dict[str, float]:
    """Correlation-based feature importance."""
    correlations = {}
    for col in X.columns:
        corr = X[col].corr(y)
        correlations[col] = abs(corr) if not np.isnan(corr) else 0.0
    return correlations


def _permutation_importance(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
) -> dict[str, float]:
    """Permutation-based feature importance (memory-optimized)."""
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.inspection import permutation_importance as sklearn_perm_importance

    # Reduced estimators and n_jobs=1 to save memory
    model = RandomForestRegressor(n_estimators=30, max_depth=4, random_state=42, n_jobs=1)
    model.fit(X_train, y_train)

    result = sklearn_perm_importance(model, X_test, y_test, n_repeats=3, random_state=42, n_jobs=1)
    importances = {col: float(imp) for col, imp in zip(X_train.columns, result.importances_mean)}

    del model, result
    gc.collect()

    return importances


def _lasso_importance(X: pd.DataFrame, y: pd.Series) -> dict[str, float]:
    """Lasso regularization-based feature importance."""
    from sklearn.linear_model import LassoCV

    lasso = LassoCV(cv=5, random_state=42, max_iter=2000)
    lasso.fit(X, y)

    return {col: abs(float(coef)) for col, coef in zip(X.columns, lasso.coef_)}


def _gradient_boosting_importance(X: pd.DataFrame, y: pd.Series) -> dict[str, float]:
    """Gradient Boosting feature importance (memory-optimized)."""
    from sklearn.ensemble import GradientBoostingRegressor

    # Reduced estimators to save memory
    model = GradientBoostingRegressor(n_estimators=50, max_depth=3, random_state=42)
    model.fit(X, y)

    importances = {col: float(imp) for col, imp in zip(X.columns, model.feature_importances_)}

    del model
    gc.collect()

    return importances
