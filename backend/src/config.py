"""Backend configuration and environment variables."""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Database
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/robotics_book"
    )

    # Qdrant Vector Database
    qdrant_url: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_api_key: Optional[str] = os.getenv("QDRANT_API_KEY", None)

    # Claude API
    claude_api_key: str = os.getenv("CLAUDE_API_KEY", "")

    # BetterAuth
    betterauth_secret: str = os.getenv("BETTERAUTH_SECRET", "")

    # Frontend
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    # CORS
    cors_origins: list = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False


# Singleton instance
settings = Settings()
