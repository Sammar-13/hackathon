"""Translation service for translating chapters."""
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.personalized_content import PersonalizedContent
from ..models.chapter import Chapter
from ..models.user import User
from ..integrations.claude_client import claude_client


class TranslationService:
    """Service for translating chapter content to other languages."""

    SUPPORTED_LANGUAGES = {
        "en": "English",
        "ur": "Urdu",
    }

    @staticmethod
    def translate_chapter(
        db: Session,
        user_id: UUID,
        chapter_id: int,
        language_code: str,
    ) -> str:
        """Translate a chapter to the specified language.

        Returns cached version if available and not expired,
        otherwise generates new translation via Claude API.
        """
        if language_code not in TranslationService.SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language: {language_code}")

        # Get user and chapter
        user = db.query(User).filter(User.id == user_id).first()
        chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()

        if not user or not chapter:
            raise ValueError("User or chapter not found")

        # Check cache
        cached = db.query(PersonalizedContent).filter(
            PersonalizedContent.user_id == user_id,
            PersonalizedContent.chapter_id == chapter_id,
            PersonalizedContent.language == language_code,
        ).first()

        if cached and not cached.is_expired():
            return cached.personalized_text

        # Generate translation
        translated_text = claude_client.translate_chapter(
            chapter.content,
            language_code,
        )

        # Cache the result
        translation = PersonalizedContent(
            user_id=user_id,
            chapter_id=chapter_id,
            experience_level=user.experience_level,
            personalized_text=translated_text,
            language=language_code,
        )
        db.add(translation)
        db.commit()

        return translated_text

    @staticmethod
    def get_cached_translation(
        db: Session,
        user_id: UUID,
        chapter_id: int,
        language_code: str,
    ) -> PersonalizedContent | None:
        """Get cached translation if available and not expired."""
        cached = db.query(PersonalizedContent).filter(
            PersonalizedContent.user_id == user_id,
            PersonalizedContent.chapter_id == chapter_id,
            PersonalizedContent.language == language_code,
        ).first()

        if cached and not cached.is_expired():
            return cached

        return None
