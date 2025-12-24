from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import get_settings

settings = get_settings()

if settings.DATABASE_URL:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
else:
    engine = None
    AsyncSessionLocal = None

Base = declarative_base()

async def get_db():
    if AsyncSessionLocal:
        async with AsyncSessionLocal() as session:
            yield session
    else:
        # Yield safe dummy or raise error depending on strictness
        # For this hackathon app, yielding None allows endpoints to check "if db:"
        yield None
