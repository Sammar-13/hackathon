"""RAG (Retrieval-Augmented Generation) service for chatbot."""
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.chat_message import ChatMessage, MessageType
from ..models.user import User
from ..integrations.claude_client import claude_client
from ..integrations.qdrant_client import qdrant_client


class RAGService:
    """Service for RAG-powered chatbot functionality."""

    @staticmethod
    def query_rag(
        db: Session,
        user_id: UUID,
        question: str,
    ) -> tuple[str, list[dict]]:
        """Query RAG system with a question.

        Returns:
            (response_text, citations)
        """
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # TODO: Generate embedding for question (requires OpenAI embeddings API)
        # For now, we'll use a placeholder
        # query_embedding = generate_embedding(question)

        # Search for relevant sections
        # similar_sections = qdrant_client.search(query_embedding, limit=5)

        # For MVP, return a placeholder response
        similar_sections = [
            {
                "chapter_title": "ROS 2 Fundamentals",
                "section_idx": 2,
                "section_text": "ROS 2 uses topics for publish-subscribe communication...",
            }
        ]

        # Generate response with Claude
        response = claude_client.rag_response(question, similar_sections)

        # Store conversation in database
        user_message = ChatMessage(
            user_id=user_id,
            message_type=MessageType.USER,
            content=question,
        )
        db.add(user_message)

        assistant_message = ChatMessage(
            user_id=user_id,
            message_type=MessageType.ASSISTANT,
            content=response,
            chapter_context="See citations in response",
        )
        db.add(assistant_message)
        db.commit()

        return response, similar_sections

    @staticmethod
    def get_conversation_history(
        db: Session,
        user_id: UUID,
        limit: int = 50,
    ) -> list[dict]:
        """Get conversation history for a user."""
        messages = db.query(ChatMessage).filter(
            ChatMessage.user_id == user_id
        ).order_by(ChatMessage.created_at.desc()).limit(limit).all()

        return [
            {
                "id": str(msg.id),
                "type": msg.message_type.value,
                "content": msg.content,
                "chapter_context": msg.chapter_context,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in reversed(messages)
        ]
