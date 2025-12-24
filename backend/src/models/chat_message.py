"""Chat message model."""
from uuid import uuid4
from sqlalchemy import Column, UUID, String, Text, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel


class MessageType(str, enum.Enum):
    """Message types for chat."""
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    """ChatMessage model for storing conversation history."""
    __tablename__ = "chat_messages"

    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=True)
    message_type = Column(SQLEnum(MessageType), nullable=False)
    content = Column(Text, nullable=False)
    chapter_context = Column(String(255), nullable=True)
    tokens_used = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User", back_populates="chat_messages")
    chapter = relationship("Chapter", back_populates="chat_messages")
