# Contributing - MAB Sports Ballclub Backend

Thanks for helping improve the API. This covers setup, conventions, and the
workflow specific to this FastAPI + Beanie backend.

## Development setup

1. Install Python 3.11+.
2. Create and activate a virtualenv:
   ```bash
   python -m venv .venv && source .venv/bin/activate
   ```
3. `pip install -r requirements-dev.txt`
4. `cp .env.example .env` and fill in `MONGO_URI`, `MONGO_DB_NAME`, a strong
   `JWT_SECRET`, `CORS_ORIGINS`, and (optionally) the bootstrap owner vars. Use
   `python scripts/hash_password.py` to generate `OWNER_PASSWORD_HASH`.
5. `uvicorn app.main:app --reload` and open http://localhost:8000/docs

## Branch and PR workflow

- The API lives on the `backend` branch. Branch from it: `git checkout -b feat/<short-name>`.
- Keep PRs focused. Reference any related issue.
- All PRs must keep the test suite green: `pytest -q`.
- Add or update tests for any behavior you change (see below).

## Coding conventions

- **Async everywhere**: route handlers and service functions are `async`; use
  Beanie/Motor async APIs. Query with dict filters (e.g.
  `Session.find_one({"status": "open"})`) - the class-attribute expression
  syntax is avoided due to version quirks in this project.
- **Layering**: keep business logic in `app/services/`, HTTP concerns in
  `app/api/routes/`, and data shapes in `app/schemas/`. Beanie documents live
  in `app/models/`.
- **Validation**: validate input via Pydantic models and the helpers in
  `app/core/validation.py`; raise `HTTPException` with clear `detail` messages.
- **Auth**: protected routes depend on `require_auth`. Never log or return
  secrets or password hashes.
- **Activity log**: user-visible actions call `log_activity(...)` so the
  dashboard feed stays accurate.
- **Config**: add settings to `app/core/config.py`; never hard-code secrets.
  `.env` stays local - `.env.example` documents the keys.
- **Comments**: prefer clear code; comment only non-obvious intent.

## Testing notes

- Tests use `pytest` + `mongomock-motor` (in-memory Mongo) via fixtures in
  `tests/conftest.py`; no real database is needed.
- Known mock limitation: `mongomock` does not honor MongoDB
  `partialFilterExpression` unique indexes, so tests use distinct phone numbers
  where blank phones would otherwise collide. Verify index-dependent behavior
  against real MongoDB when in doubt.
- Run the full suite before submitting: `pytest -q`.

## Before you submit

- [ ] `pytest -q` passes
- [ ] New/changed endpoints have tests and appear correctly in `/docs`
- [ ] No secrets committed; `.env` stays local
- [ ] Backwards-compatible response shapes, or the change is called out in the PR

## Reporting bugs / requesting features

Open a GitHub issue with reproduction steps (method, path, payload, expected vs
actual response) for bugs, or a description of the use case for features.
