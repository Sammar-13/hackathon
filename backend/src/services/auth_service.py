"""Authentication service."""
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session
import secrets

from ..models.session import Session as SessionModel
from ..models.user import User


class AuthService:
    """Service for authentication and session management."""

    @staticmethod
    def create_session(
        db: Session,
        user_id: UUID,
        expires_in_hours: int = 24,
    ) -> SessionModel:
        """Create a new session for user."""
        # Generate secure token
        session_token = secrets.token_urlsafe(32)

        # Create session
        session = SessionModel(
            user_id=user_id,
            session_token=session_token,
            expires_at=datetime.utcnow() + timedelta(hours=expires_in_hours),
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def validate_session(db: Session, session_token: str) -> SessionModel | None:
        """Validate session token."""
        session = db.query(SessionModel).filter(
            SessionModel.session_token == session_token
        ).first()

        if not session or session.is_expired():
            return None

        return session

    @staticmethod
    def get_user_from_session(db: Session, session_token: str) -> User | None:
        """Get user from session token."""
        session = AuthService.validate_session(db, session_token)
        if not session:
            return None

        return session.user

    @staticmethod
    def invalidate_session(db: Session, session_token: str) -> bool:
        """Invalidate a session (logout)."""
        session = db.query(SessionModel).filter(
            SessionModel.session_token == session_token
        ).first()

        if not session:
            return False

        session.is_active = False
        db.commit()
        return True

    @staticmethod
    def update_session_activity(db: Session, session_token: str) -> bool:
        """Update last activity timestamp for session."""
        session = db.query(SessionModel).filter(
            SessionModel.session_token == session_token
        ).first()

        if not session or session.is_expired():
            return False

        session.last_activity = datetime.utcnow()
        db.commit()
        return True
