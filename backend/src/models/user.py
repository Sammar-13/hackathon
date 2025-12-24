"""User model."""
from uuid import uuid4
from sqlalchemy import Column, String, UUID, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .base import BaseModel


class ExperienceLevel(str, enum.Enum):
    """User experience levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class User(BaseModel):
    """User model for storing learner profiles."""
    __tablename__ = "users"

    id = Column(UUID, primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    os = Column(String(50), nullable=False)
    gpu = Column(String(50), nullable=False)
    experience_level = Column(
        SQLEnum(ExperienceLevel),
        nullable=False,
        default=ExperienceLevel.BEGINNER
    )
    robotics_background = Column(String(2000), nullable=True)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    personalized_content = relationship("PersonalizedContent", back_populates="user", cascade="all, delete-orphan")
