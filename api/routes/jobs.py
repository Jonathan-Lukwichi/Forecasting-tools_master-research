"""
Background job management endpoints.

Provides REST polling and WebSocket streaming for Celery task progress.

=== TRIANGULATION RECORD ===
Task: Job status API for background ML training tasks
Approach: REST polling (GET /api/jobs/{id}) + WebSocket streaming (WS /api/ws/jobs/{id})

Vertex 1 (Academic):
  Source: Huyen, C. (2022). "Designing Machine Learning Systems", Ch.9. O'Reilly.
  Finding: Async ML pipelines need status tracking, cancellation, and result retrieval.
  Relevance: Training can take minutes — users need progress feedback.

Vertex 2 (Industry):
  Source: https://celery.school/celery-progress-bars-with-fastapi-htmx
  Source: https://docs.santosdevco.com/celeryfastapi/lab5/
  Pattern: Celery AsyncResult for polling, WebSocket for push-based updates.
  Adaptation: Both REST and WebSocket endpoints for flexibility.

Vertex 3 (Internal):
  Files checked: api/schemas/ml.py (TrainProgressEvent exists), api/workers/celery_app.py
  Consistency: Confirmed — tasks use update_state(), AsyncResult reads state.

Verdict: PROCEED
=============================
"""
from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect

from api.dependencies import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _get_celery():
    """Lazy import Celery app to avoid import errors when Celery is not installed."""
    from api.workers.celery_app import celery_app
    return celery_app


# ---------------------------------------------------------------------------
# Submit training job
# ---------------------------------------------------------------------------
@router.post("/train")
def submit_training_job(
    body: dict[str, Any],
    _user: dict = Depends(get_current_user),
) -> dict[str, str]:
    """Submit an ML training job to the Celery queue. Returns job_id immediately."""
    from api.workers.training_tasks import train_ml_model

    task = train_ml_model.delay(
        dataset_id=body["dataset_id"],
        model_type=body["model_type"],
        horizons=body.get("horizons", [1, 2, 3, 4, 5, 6, 7]),
        hyperparameters=body.get("hyperparameters", {}),
        auto_tune=body.get("auto_tune", False),
        n_trials=body.get("n_trials", 50),
    )

    return {"job_id": task.id, "status": "queued"}


@router.post("/train/baseline")
def submit_baseline_job(
    body: dict[str, Any],
    _user: dict = Depends(get_current_user),
) -> dict[str, str]:
    """Submit a baseline model training job."""
    from api.workers.training_tasks import train_baseline_model

    task = train_baseline_model.delay(
        dataset_id=body["dataset_id"],
        model_type=body["model_type"],
        order=body.get("order"),
        seasonal_order=body.get("seasonal_order"),
        auto_order=body.get("auto_order", True),
    )

    return {"job_id": task.id, "status": "queued"}


# ---------------------------------------------------------------------------
# Poll job status (REST)
# ---------------------------------------------------------------------------
@router.get("/{job_id}")
def get_job_status(
    job_id: str,
    _user: dict = Depends(get_current_user),
) -> dict[str, Any]:
    """Poll the status of a background job."""
    result = _get_celery().AsyncResult(job_id)

    if result.state == "PENDING":
        return {"job_id": job_id, "status": "queued", "progress": 0.0, "message": "Waiting in queue..."}

    if result.state == "PROGRESS":
        meta = result.info or {}
        return {
            "job_id": job_id,
            "status": "running",
            "progress": meta.get("progress", 0.0),
            "stage": meta.get("stage", "unknown"),
            "message": meta.get("message", ""),
        }

    if result.state == "SUCCESS":
        return {
            "job_id": job_id,
            "status": "completed",
            "progress": 1.0,
            "result": result.result,
        }

    if result.state == "FAILURE":
        return {
            "job_id": job_id,
            "status": "failed",
            "progress": 0.0,
            "error": str(result.info),
        }

    return {"job_id": job_id, "status": result.state, "progress": 0.0}


# ---------------------------------------------------------------------------
# Cancel job
# ---------------------------------------------------------------------------
@router.delete("/{job_id}")
def cancel_job(
    job_id: str,
    _user: dict = Depends(get_current_user),
) -> dict[str, Any]:
    """Cancel a running or queued job."""
    celery_app.control.revoke(job_id, terminate=True)
    return {"job_id": job_id, "cancelled": True}


# ---------------------------------------------------------------------------
# WebSocket for real-time progress (no auth for simplicity in prototype)
# ---------------------------------------------------------------------------
ws_router = APIRouter()


@ws_router.websocket("/api/ws/jobs/{job_id}")
async def job_progress_ws(websocket: WebSocket, job_id: str):
    """
    WebSocket endpoint for real-time training progress.
    Client connects and receives progress events until job completes.
    """
    await websocket.accept()

    try:
        while True:
            result = _get_celery().AsyncResult(job_id)

            if result.state == "PENDING":
                await websocket.send_json({"status": "queued", "progress": 0.0, "message": "Waiting..."})
            elif result.state == "PROGRESS":
                meta = result.info or {}
                await websocket.send_json({
                    "status": "running",
                    "progress": meta.get("progress", 0.0),
                    "stage": meta.get("stage", ""),
                    "message": meta.get("message", ""),
                })
            elif result.state == "SUCCESS":
                await websocket.send_json({
                    "status": "completed",
                    "progress": 1.0,
                    "result": result.result,
                })
                break
            elif result.state == "FAILURE":
                await websocket.send_json({
                    "status": "failed",
                    "error": str(result.info),
                })
                break

            await asyncio.sleep(1)  # Poll every 1 second

    except WebSocketDisconnect:
        pass
