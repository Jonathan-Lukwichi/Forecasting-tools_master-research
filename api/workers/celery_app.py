"""
Celery application configuration for HealthForecast AI.

This is a Phase 3 placeholder. The full implementation will include:
- Training tasks (ML model training as background jobs)
- Optimization tasks (MILP solving as background jobs)
- Progress reporting via Redis pub/sub

=== TRIANGULATION RECORD ===
Task: Celery worker configuration for async ML training
Approach: Celery + Redis broker, task routing, progress reporting

Vertex 1 (Academic):
  Source: Huyen, C. (2022). "Designing Machine Learning Systems", Ch.7. O'Reilly.
  Finding: Long-running ML jobs must be decoupled from request-response cycle
  Relevance: Model training (minutes) must not block API (milliseconds)

Vertex 2 (Industry):
  Source: https://testdriven.io/courses/fastapi-celery/docker/
  Pattern: Celery app in separate module, Redis broker, task autodiscovery
  Adaptation: Standard pattern, added health check task

Vertex 3 (Internal):
  Files checked: api/config.py:40 (redis_url already defined)
  Consistency: Confirmed — redis_url setting exists, CORS configured

Verdict: PROCEED
=============================
"""
from __future__ import annotations

import os

from celery import Celery

# Redis URL from environment (matches api/config.py Settings)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "healthforecast",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",

    # Timezone
    timezone="UTC",
    enable_utc=True,

    # Task routing (Phase 3)
    task_routes={
        "api.workers.training_tasks.*": {"queue": "training"},
        "api.workers.optimization_tasks.*": {"queue": "optimization"},
    },

    # Result expiry (24 hours)
    result_expires=86400,

    # Worker settings
    worker_prefetch_multiplier=1,  # Fair task distribution
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks (memory cleanup)
)

# Auto-discover task modules
celery_app.autodiscover_tasks(["api.workers"])


@celery_app.task(name="healthcheck")
def healthcheck() -> dict:
    """Simple health check task to verify Celery is running."""
    return {"status": "ok", "worker": "healthy"}
