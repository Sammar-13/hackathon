"""Database configuration and session management."""
import time
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import OperationalError

from .config import settings
from .models.base import Base


# Create engine using the corrected URL from settings
# pool_pre_ping=True ensures the connection is alive before use.
engine = create_engine(
    settings.sqlalchemy_database_url,
    poolclass=StaticPool if "sqlite" in settings.sqlalchemy_database_url else None,
    echo=False,
    pool_pre_ping=True,
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(retries: int = 5, delay: int = 3):
    """
    Initialize database schema with robust retry logic.
    This prevents the app from crashing if the database is not ready on startup.
    """
    for i in range(retries):
        try:
            # The 'connect' method will raise an OperationalError if the DB is not available.
            with engine.connect() as connection:
                print("Database connection successful.")
                Base.metadata.create_all(bind=engine)
                print("Database schema initialized.")
                return
        except OperationalError as e:
            if i == retries - 1:
                print(f"CRITICAL: Could not connect to database after {retries} attempts.")
                # We raise the exception here to be caught by the lifespan manager
                raise e
            
            print(f"Database connection failed. Retrying in {delay} seconds... (Attempt {i + 1}/{retries})")
            time.sleep(delay)
