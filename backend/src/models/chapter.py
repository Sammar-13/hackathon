"""Chapter model."""
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import BaseModel


class Chapter(BaseModel):
    """Chapter model for storing book chapters."""
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    order = Column(Integer, nullable=False, unique=True)
    section_count = Column(Integer, nullable=False, default=0)

    # Relationships
    personalized_content = relationship("PersonalizedContent", back_populates="chapter", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="chapter", cascade="all, delete-orphan")
