"""Personalization API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from ..database import get_db
from ..services.personalization_service import PersonalizationService
from ..services.auth_service import AuthService

router = APIRouter(prefix="/api", tags=["personalization"])


@router.post("/personalize")
async def personalize_chapter(
    chapter_id: int,
    authorization: str = None,
    db: Session = Depends(get_db)
):
    """Personalize a chapter for the authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    session_token = authorization[7:]
    user = AuthService.get_user_from_session(db=db, session_token=session_token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    try:
        personalized_text = PersonalizationService.personalize_chapter(
            db=db,
            user_id=user.id,
            chapter_id=chapter_id,
        )

        return {
            "chapter_id": chapter_id,
            "personalized_text": personalized_text,
            "experience_level": user.experience_level.value,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Personalization failed")
