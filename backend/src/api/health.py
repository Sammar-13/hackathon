"""Health check endpoint."""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "robotics-book-platform",
        "version": "1.0.0"
    }
