"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .middleware.error_handler import ErrorHandlerMiddleware
from .database import init_db
from .api.health import router as health_router
from .api.auth_routes import router as auth_router
from .api.chapter_routes import router as chapter_router
from .api.personalize_routes import router as personalize_router
from .api.translate_routes import router as translate_router
from .api.chat_routes import router as chat_router


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup: safely initialize the database."""
    print("Starting backend server...")
    try:
        init_db()
    except Exception as e:
        # If init_db fails after all retries, log the critical error.
        # The server will continue running but database operations will fail.
        # This allows the service to be inspected instead of crash-looping.
        print(f"CRITICAL: Database initialization failed. Server is running without DB connection. Error: {e}")
    
    yield
    
    # Shutdown
    print("Shutting down backend server...")


# Initialize FastAPI app
app = FastAPI(
    title="Robotics Book Platform API",
    description="REST API for Physical AI & Humanoid Robotics Book Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handler middleware
app.add_middleware(ErrorHandlerMiddleware)

# Include routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(chapter_router)
app.include_router(personalize_router)
app.include_router(translate_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Robotics Book Platform API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
