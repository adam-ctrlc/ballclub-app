# MAB Sports Ballclub - Backend

Async **FastAPI** + **Beanie** (MongoDB) API for a basketball ballclub: owner
authentication, session/queue management with fees, capacity and metadata, a
member directory with attendance history, owner accounts, dashboard stats and
revenue, CSV export, pagination, and a rate-limited public join flow.

This is the **backend** branch of
[adam-ctrlc/ballclub-app](https://github.com/adam-ctrlc/ballclub-app); the Vue
frontend lives on the [`frontend`](https://github.com/adam-ctrlc/ballclub-app/tree/frontend)
branch.

Live API: https://ballclub-backend.vercel.app (docs at `/docs`)

## Tech stack

- **FastAPI** (ASGI) + **Uvicorn**
- **Beanie** ODM over **Motor** (async MongoDB driver) - MongoDB Atlas
- **Pydantic v2** / **pydantic-settings** for models and config
- **PyJWT** (HS256) auth, **bcrypt** password hashing
- **SlowAPI** rate limiting (login + public join)
- **pytest** + **mongomock-motor** for tests

## Prerequisites

- Python 3.11+
- A MongoDB connection string (local `mongodb://localhost:27017` or Atlas)

## Getting started

```bash
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt  # or requirements.txt for runtime only

cp .env.example .env                 # then fill in the values below
uvicorn app.main:app --reload        # http://localhost:8000  (docs at /docs)
```

### Environment variables

Configured in `.env` (see `.env.example`). The app **fails fast on startup** if
`JWT_SECRET` is left at the insecure default.

| Variable              | Required | Description                                              |
| --------------------- | -------- | -------------------------------------------------------- |
| `MONGO_URI`           | yes      | MongoDB connection string                                |
| `MONGO_DB_NAME`       | yes      | Database name (e.g. `ballclub`)                          |
| `JWT_SECRET`          | yes      | Random 32+ char secret for signing JWTs                  |
| `JWT_ALGORITHM`       | no       | Defaults to `HS256`                                      |
| `JWT_EXPIRE_DAYS`     | no       | Token lifetime in days (default `7`)                     |
| `CORS_ORIGINS`        | yes      | JSON array of allowed origins (must include the frontend)|
| `OWNER_USERNAME`      | no       | Bootstrap owner username (seeded if no owners exist)     |
| `OWNER_PASSWORD_HASH` | no       | bcrypt hash for the bootstrap owner (see below)          |

Generate a bootstrap password hash:

```bash
python scripts/hash_password.py
```

The first time the DB has no owners, `OWNER_USERNAME` + `OWNER_PASSWORD_HASH`
seed the initial owner account.

## Running tests

```bash
pytest -q
```

Tests use `mongomock-motor` (in-memory Mongo), so no real database is required.

## API surface

All routes are mounted under `/api`:

- `POST /api/auth/login`, `GET/PATCH /api/auth/me`, profile + password endpoints
- `GET/POST /api/sessions/`, plus `/{id}` fee, metadata, close, walk-in,
  players (toggle paid / delete), pending approve/decline, and `/{id}/export` (CSV)
- `GET/POST/PATCH/DELETE /api/members/`, `GET /api/members/export`,
  `GET /api/members/{id}/history`
- `GET/POST/DELETE /api/owners/`
- `GET /api/dashboard/`
- `GET /api/public/session/{share_code}`, `GET /api/public/lookup`,
  `POST /api/public/session/{share_code}/join`
- `GET /api/health`

Interactive docs are served at `/docs` (Swagger UI) and `/redoc`.

## Project structure

```
app/
  api/          route modules + dependencies (auth)
  core/         config, security (JWT/bcrypt), validation, rate limiting
  models/       Beanie documents (Member, Session, Owner, Activity)
  schemas/      Pydantic response/request models
  services/     business logic (sessions, members, activity log)
  db.py         Beanie init + owner bootstrap
  main.py       FastAPI app (used by uvicorn and tests)
api/index.py    Vercel serverless entrypoint (lazy DB init)
scripts/        hash_password.py
tests/          pytest suite (mongomock)
```

## Deployment (Vercel)

`vercel.json` routes all requests to `api/index.py`, which wraps `app.main:app`
and initializes MongoDB lazily on the first request (Vercel's ASGI adapter does
not run FastAPI lifespan events reliably). Set all required env vars in the
Vercel project, and ensure the MongoDB Atlas Network Access list allows Vercel
(e.g. `0.0.0.0/0`, since serverless egress IPs are dynamic).

## License

Apache License 2.0 - see [LICENSE](./LICENSE). Contributions welcome; see
[CONTRIBUTING.md](./CONTRIBUTING.md).
