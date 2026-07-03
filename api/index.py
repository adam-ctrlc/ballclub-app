"""Vercel serverless entrypoint.

Vercel's Python ASGI adapter does not reliably run FastAPI lifespan startup
events, so Beanie/Mongo initialization is done lazily on the first request via
a guard middleware. This module is only imported in the Vercel runtime; local
uvicorn and the test suite use ``app.main:app`` directly (with the lifespan).
"""

from app.core.config import validate_settings
from app.db import init_db
from app.main import app

_ready = False


@app.middleware("http")
async def _ensure_initialized(request, call_next):
    global _ready
    if not _ready:
        validate_settings()
        await init_db()
        _ready = True
    return await call_next(request)
