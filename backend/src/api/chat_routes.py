"""Chat API routes for RAG chatbot."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from ..services.rag_service import RAGService
from ..services.auth_service import AuthService

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    """Chat request schema."""
    question: str


class ChatResponse(BaseModel):
    """Chat response schema."""
    response: str
    citations: list[dict]


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    authorization: str = None,
    db: Session = Depends(get_db)
):
    """Send a question to the RAG chatbot."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    session_token = authorization[7:]
    user = AuthService.get_user_from_session(db=db, session_token=session_token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    try:
        response, citations = RAGService.query_rag(
            db=db,
            user_id=user.id,
            question=request.question,
        )

        return ChatResponse(
            response=response,
            citations=citations,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Chat failed")


@router.get("/chat/history")
async def get_chat_history(
    limit: int = 50,
    authorization: str = None,
    db: Session = Depends(get_db)
):
    """Get chat history for the authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    session_token = authorization[7:]
    user = AuthService.get_user_from_session(db=db, session_token=session_token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    try:
        history = RAGService.get_conversation_history(
            db=db,
            user_id=user.id,
            limit=limit,
        )

        return {"messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve history")
