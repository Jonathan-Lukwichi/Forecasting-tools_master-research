"""
HealthForecast AI — FastAPI entry point.

Run with:
    uvicorn api.main:app --reload --port 8000

Docs at:
    http://localhost:8000/docs  (Swagger UI)
    http://localhost:8000/redoc (ReDoc)
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import get_settings
from api.routes import auth, data, models, forecast, kpi, optimization, jobs

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="REST API for HealthForecast AI — hospital demand forecasting and resource optimization.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — allow Next.js frontend
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (thesis prototype)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------
API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(data.router, prefix=API_PREFIX)
app.include_router(models.router, prefix=API_PREFIX)
app.include_router(forecast.router, prefix=API_PREFIX)
app.include_router(kpi.router, prefix=API_PREFIX)
app.include_router(optimization.router, prefix=API_PREFIX)
app.include_router(jobs.router, prefix=API_PREFIX)

# WebSocket router (no prefix — path defined in route)
app.include_router(jobs.ws_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/", tags=["System"])
def root():
    return {
        "message": "HealthForecast AI API",
        "docs": "/docs",
        "health": "/health",
    }
