"""Personalized content model."""
from uuid import uuid4
from sqlalchemy import Column, UUID, String, Text, Integer, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import enum

from .base import BaseModel
from .user import ExperienceLevel


class PersonalizedContent(BaseModel):
    """PersonalizedContent model for caching personalized chapter versions."""
    __tablename__ = "personalized_content"

    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False, index=True)
    experience_level = Column(SQLEnum(ExperienceLevel), nullable=False)
    personalized_text = Column(Text, nullable=False)
    language = Column(String(10), nullable=False, default="en")
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(days=30))

    # Relationships
    user = relationship("User", back_populates="personalized_content")
    chapter = relationship("Chapter", back_populates="personalized_content")

    def is_expired(self) -> bool:
        """Check if cache has expired."""
        return datetime.utcnow() > self.expires_at

    __table_args__ = (
        # Composite unique constraint
        __table_args__ + (
            # Constraint will be added via migration
        ) if '__table_args__' in dir(BaseModel) else ()
    )
