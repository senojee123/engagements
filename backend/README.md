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

---

## ⚡ WebSocket Events (`ws://localhost:8000/ws`)

All connected stadium display screens (`/display`) and moderation desks connect to `ws://localhost:8000/ws`.

The server automatically broadcasts the following real-time JSON events:
- `SELFIE_SUBMITTED`: Fired when a fan uploads a selfie from mobile.
- `SELFIE_APPROVED`: Fired when an organizer approves a selfie (triggers 3s pop-up spotlight on `/display` screen).
- `STATUS_UPDATED`: Fired when switching between Idle Screen and Selfie Wall (`isSelfieWallActive`).
- `IDLE_CONFIG_UPDATED`: Fired when event title or sponsor logos are updated.
- `BRAND_UPDATED`: Fired when active brand preset changes.
