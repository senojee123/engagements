import os
from dotenv import load_dotenv

# Load local .env variables
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_SQLITE_PATH = os.path.join(BASE_DIR, "engagements.db")

# Production (Vercel) must set DATABASE_URL to a real Postgres connection
# (Supabase pooler, port 6543) as an environment variable — never hardcode
# credentials here. Without it, this falls back to a local SQLite file,
# which only works for local development (Vercel's filesystem is read-only
# outside /tmp, so a misconfigured deploy fails loudly instead of silently
# losing data).
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    if DATABASE_URL.startswith("postgresql") and "sslmode" not in DATABASE_URL:
        DATABASE_URL += "&sslmode=require" if "?" in DATABASE_URL else "?sslmode=require"
else:
    DATABASE_URL = f"sqlite:///{LOCAL_SQLITE_PATH}"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    # NullPool used to be used here to avoid connection exhaustion on serverless
    # (Vercel): each request there can land on a separate, independently-scaled
    # process, so every one of those processes trying to hold its own pool of
    # connections multiplies out of control under load. That reasoning doesn't
    # apply to a single persistent process (e.g. Render's web service, one
    # process for the app's whole lifetime) -- there, NullPool just pays a full
    # connection handshake on every single request instead of reusing a small,
    # already-open pool across that one process's entire runtime. A bounded
    # QueuePool (SQLAlchemy's default) is strictly better here and can't
    # reintroduce the original multi-process exhaustion, since there's only
    # ever one process holding it.
    #
    # If this backend is ever deployed back onto a serverless platform where
    # requests can land on independently-scaled processes, this needs to
    # revert to NullPool for that deployment -- a bounded pool is only correct
    # for a single persistent process.
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_size=10,
        max_overflow=10,
        pool_recycle=300,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency provider for database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
