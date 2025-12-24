"""Personalization service for adapting chapter content."""
from uuid import UUID
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.personalized_content import PersonalizedContent
from ..models.chapter import Chapter
from ..models.user import User, ExperienceLevel
from ..integrations.claude_client import claude_client


class PersonalizationService:
    """Service for personalizing chapter content based on user experience level."""

    @staticmethod
    def personalize_chapter(
        db: Session,
        user_id: UUID,
        chapter_id: int,
    ) -> str:
        """Personalize a chapter for the user.

        Returns cached version if available and not expired,
        otherwise generates new personalized content via Claude API.
        """
        # Get user and chapter
        user = db.query(User).filter(User.id == user_id).first()
        chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()

        if not user or not chapter:
            raise ValueError("User or chapter not found")

        # Check cache
        cached = db.query(PersonalizedContent).filter(
            PersonalizedContent.user_id == user_id,
            PersonalizedContent.chapter_id == chapter_id,
            PersonalizedContent.experience_level == user.experience_level.value,
            PersonalizedContent.language == "en",
        ).first()

        if cached and not cached.is_expired():
            return cached.personalized_text

        # Generate personalized content
        personalized_text = claude_client.personalize_chapter(
            chapter.content,
            user.experience_level.value,
        )

        # Cache the result
        personalized = PersonalizedContent(
            user_id=user_id,
            chapter_id=chapter_id,
            experience_level=user.experience_level,
            personalized_text=personalized_text,
            language="en",
        )
        db.add(personalized)
        db.commit()

        return personalized_text

    @staticmethod
    def get_cached_personalization(
        db: Session,
        user_id: UUID,
        chapter_id: int,
        experience_level: ExperienceLevel,
    ) -> PersonalizedContent | None:
        """Get cached personalized content if available and not expired."""
        cached = db.query(PersonalizedContent).filter(
            PersonalizedContent.user_id == user_id,
            PersonalizedContent.chapter_id == chapter_id,
            PersonalizedContent.experience_level == experience_level.value,
            PersonalizedContent.language == "en",
        ).first()

        if cached and not cached.is_expired():
            return cached

        return None
