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

# Optimize engine parameters for serverless runtime and connection pooling
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    # Use NullPool for serverless environments (like Vercel) to prevent connection exhaustion.
    # It opens and closes connections on demand instead of keeping them open in a pool.
    from sqlalchemy.pool import NullPool
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        poolclass=NullPool
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
