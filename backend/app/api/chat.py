from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import ChatSession, ChatMessage
from app.rag.rag_engine import RAGEngine
from sqlalchemy import select
import uuid
import logging
from typing import List, Optional, Dict

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
rag_engine = RAGEngine()

class ChatRequest(BaseModel):
    message: str = ""
    history: List[Dict[str, str]] = []
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Log request (safe)
        logger.info(f"Chat request received. Session: {request.session_id}, Message len: {len(request.message)}")
        
        session_id = request.session_id or str(uuid.uuid4())
        
        # 1. DB Operations (Best Effort)
        try:
            # Create session if new
            if not request.session_id:
                new_session = ChatSession(id=session_id)
                db.add(new_session)
                await db.commit()
            
            # Save User Message
            if request.message:
                user_msg = ChatMessage(session_id=session_id, role="user", content=request.message)
                db.add(user_msg)
                await db.commit()
        except Exception as e:
            logger.error(f"Database error (non-critical): {e}")
            # Continue without DB if it fails

        # 2. RAG Generation
        # Use provided history if available, else fetch from DB (if DB worked)
        history = request.history
        if not history and request.session_id:
             try:
                result = await db.execute(
                    select(ChatMessage)
                    .where(ChatMessage.session_id == session_id)
                    .order_by(ChatMessage.created_at)
                )
                history = result.scalars().all()
             except Exception:
                 pass # Fallback to empty history

        answer = await rag_engine.get_answer(request.message, history)

        # 3. Save Assistant Message (Best Effort)
        try:
            bot_msg = ChatMessage(session_id=session_id, role="assistant", content=answer)
            db.add(bot_msg)
            await db.commit()
        except Exception as e:
            logger.error(f"Database save error: {e}")

        return ChatResponse(response=answer, session_id=session_id)

    except Exception as e:
        logger.error(f"Critical error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
