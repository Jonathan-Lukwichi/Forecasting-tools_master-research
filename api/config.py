"""
FastAPI configuration — loads settings from environment or .env file.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    app_name: str = "HealthForecast AI API"
    app_version: str = "1.0.0"
    debug: bool = False

    # Auth
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # LLM
    llm_provider: str = "anthropic"
    llm_api_key: str = ""

    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://healthforecast-ai.vercel.app",
        "https://healthforecast-app.vercel.app",
        "https://hf-ai-frontend.vercel.app",
        "https://healthforecast-v2.vercel.app",
        "https://healthforecast-app-git-main-jonathan-lukwichis-projects.vercel.app",
    ]

    # File uploads
    max_upload_size_mb: int = 50
    upload_dir: str = "uploads"

    # Celery / background tasks (Phase 2)
    redis_url: str = "redis://localhost:6379/0"

    # Paths
    project_root: str = str(Path(__file__).resolve().parent.parent)
    artifacts_dir: str = "pipeline_artifacts"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
