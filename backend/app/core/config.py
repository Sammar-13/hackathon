from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # RAG Settings
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Database (Postgres)
    DATABASE_URL: Optional[str] = None
    
    # Qdrant (Optional/Legacy)
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_URL: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "robotics-book"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()
