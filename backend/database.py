import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

if os.getenv("VERCEL") and not os.getenv("DATABASE_URL"):
    DEFAULT_DB_PATH = "/tmp/engagements.db"
else:
    DEFAULT_DB_PATH = os.path.join(BASE_DIR, "engagements.db")

SUPABASE_DB_URL = "postgresql://postgres:Pabasara%402003!@db.awjaovibrslzghflwwin.supabase.co:5432/postgres"

# Default to Supabase PostgreSQL if running on Vercel or if DATABASE_URL set
DATABASE_URL = os.getenv("DATABASE_URL", SUPABASE_DB_URL)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency provider for database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
