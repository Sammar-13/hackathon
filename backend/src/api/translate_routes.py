"""Translation API routes."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.translation_service import TranslationService
from ..services.auth_service import AuthService

router = APIRouter(prefix="/api", tags=["translate"])


@router.post("/translate")
async def translate_chapter(
    chapter_id: int,
    language_code: str = "ur",
    authorization: str = None,
    db: Session = Depends(get_db)
):
    """Translate a chapter to the specified language."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    session_token = authorization[7:]
    user = AuthService.get_user_from_session(db=db, session_token=session_token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    try:
        translated_text = TranslationService.translate_chapter(
            db=db,
            user_id=user.id,
            chapter_id=chapter_id,
            language_code=language_code,
        )

        return {
            "chapter_id": chapter_id,
            "language_code": language_code,
            "translated_text": translated_text,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Translation failed")
