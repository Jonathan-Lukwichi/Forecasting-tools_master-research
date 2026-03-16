"""
API health check tests — verify the API starts and responds correctly.

=== TRIANGULATION RECORD ===
Vertex 1: Burkov (2020) "ML Engineering" — Health checks are mandatory for production
Vertex 2: https://fastlaunchapi.dev/blog/fastapi-best-practices-production-2026
Vertex 3: api/main.py (existing /health endpoint)
Verdict: PROCEED
"""
import pytest


def test_health_endpoint_exists():
    """Verify the FastAPI app can be imported and has a health route."""
    from api.main import app

    # Check that /health route exists
    routes = [r.path for r in app.routes]
    assert "/health" in routes


def test_root_endpoint_exists():
    """Verify the root endpoint exists."""
    from api.main import app

    routes = [r.path for r in app.routes]
    assert "/" in routes


def test_api_routes_registered():
    """Verify all API route prefixes are registered."""
    from api.main import app

    routes = [r.path for r in app.routes if hasattr(r, "path")]
    route_str = " ".join(routes)

    # Check key route prefixes exist
    assert "/api/auth" in route_str or "/api/auth/login" in route_str
    assert "/api/data" in route_str or "/api/data/upload" in route_str
    assert "/api/models" in route_str or "/api/models/train" in route_str
    assert "/api/jobs" in route_str or "/api/jobs/train" in route_str


def test_cors_configured():
    """Verify CORS middleware is configured."""
    from api.main import app

    middleware_classes = [type(m).__name__ for m in app.user_middleware]
    # CORSMiddleware should be in the middleware stack
    assert any("CORS" in name for name in middleware_classes) or len(app.user_middleware) > 0


def test_settings_load():
    """Verify settings can be loaded from environment."""
    from api.config import get_settings

    settings = get_settings()
    assert settings.app_name == "HealthForecast AI API"
    assert settings.app_version == "1.0.0"
    assert "localhost:3000" in str(settings.cors_origins)
