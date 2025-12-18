"""Chapter API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.chapter import Chapter

router = APIRouter(prefix="/api/chapters", tags=["chapters"])


@router.get("/")
async def list_chapters(db: Session = Depends(get_db)):
    """List all chapters."""
    chapters = db.query(Chapter).order_by(Chapter.order).all()
    return [
        {
            "id": ch.id,
            "title": ch.title,
            "slug": ch.slug,
            "order": ch.order,
        }
        for ch in chapters
    ]


@router.get("/{chapter_id}")
async def get_chapter(chapter_id: int, db: Session = Depends(get_db)):
    """Get a specific chapter."""
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()

    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    return {
        "id": chapter.id,
        "title": chapter.title,
        "slug": chapter.slug,
        "content": chapter.content,
        "order": chapter.order,
    }
