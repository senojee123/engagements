# FanForge Engagement OS - Python FastAPI Backend

High-performance Python backend built with **FastAPI**, **SQLAlchemy** (SQLite / PostgreSQL), and **WebSockets** for real-time stadium screen engagement.

---

## 🚀 Quick Start (Local Setup)

### 1. Navigate to the backend directory
```bash
cd backend
```

### 2. Create and activate a Virtual Environment (Optional but Recommended)
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the FastAPI Development Server
```bash
uvicorn main:app --reload --port 8000
```

The backend server will start at:
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger API Docs**: `http://localhost:8000/docs`
- **ReDoc API Documentation**: `http://localhost:8000/redoc`
- **Real-Time WebSocket Endpoint**: `ws://localhost:8000/ws`

---

## 🗄️ Database Configuration

By default, the backend initializes a local **SQLite** database (`engagements.db`) in the `backend/` directory with zero manual configuration required.

To connect to a **PostgreSQL** database (e.g. AWS RDS, Supabase, Neon, or local Docker PostgreSQL), set the `DATABASE_URL` environment variable:

```bash
# Windows (PowerShell)
$env:DATABASE_URL="postgresql://username:password@localhost:5432/fanforge"

# Linux / macOS
export DATABASE_URL="postgresql://username:password@localhost:5432/fanforge"
```

**On Vercel (or any serverless host), `DATABASE_URL` is required** — the filesystem is
read-only outside `/tmp`, and `/tmp` is wiped between invocations, so SQLite cannot
persist data there. Set `DATABASE_URL` in the Vercel project's Environment Variables,
not in source code.

If using **Supabase**, use the **pooler connection string** (Settings → Connect →
Transaction pooler, port `6543`), not the direct connection (`db.<ref>.supabase.co`,
port `5432`). The direct host is IPv6-only and unreachable from Vercel's serverless
runtime; the pooler host resolves to IPv4 and is built for exactly this use case.

---

## 🔐 Authentication

`POST /api/auth/login` and `/register` return `{ "user": {...}, "accessToken": "..." }`.
Send the token back on every subsequent request as `Authorization: Bearer <accessToken>`.
Tokens are signed with `SECRET_KEY` and expire after 7 days.

Set `SECRET_KEY` as an environment variable in production:

```bash
# Windows (PowerShell)
$env:SECRET_KEY="<a long random value>"

# Linux / macOS
export SECRET_KEY="<a long random value>"
```

Without it, the backend falls back to a fixed, publicly-known development value
and prints a warning on startup — tokens signed with it are forgeable, so this
fallback must never be used in production.

---

## ⚡ WebSocket Events (`ws://localhost:8000/ws`)

All connected stadium display screens (`/display`) and moderation desks connect to `ws://localhost:8000/ws`.

The server automatically broadcasts the following real-time JSON events:
- `SELFIE_SUBMITTED`: Fired when a fan uploads a selfie from mobile.
- `SELFIE_APPROVED`: Fired when an organizer approves a selfie (triggers 3s pop-up spotlight on `/display` screen).
- `STATUS_UPDATED`: Fired when switching between Idle Screen and Selfie Wall (`isSelfieWallActive`).
- `IDLE_CONFIG_UPDATED`: Fired when event title or sponsor logos are updated.
- `BRAND_UPDATED`: Fired when active brand preset changes.
