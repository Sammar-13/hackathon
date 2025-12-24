"""Tests for authentication service."""
import pytest
from src.services.auth_service import AuthService
from src.services.user_service import UserService
from src.models.user import ExperienceLevel


def test_create_session(db_session):
    """Test session creation."""
    # Create user first
    user = UserService.create_user(
        db=db_session,
        email="test@example.com",
        password="password123",
        name="Test User",
        os="Ubuntu",
        gpu="None",
    )

    # Create session
    session = AuthService.create_session(db=db_session, user_id=user.id)

    assert session.user_id == user.id
    assert session.session_token is not None
    assert session.is_active is True


def test_validate_session(db_session):
    """Test session validation."""
    # Create user and session
    user = UserService.create_user(
        db=db_session,
        email="test@example.com",
        password="password123",
        name="Test User",
        os="Ubuntu",
        gpu="None",
    )

    session = AuthService.create_session(db=db_session, user_id=user.id)

    # Validate session
    validated = AuthService.validate_session(db=db_session, session_token=session.session_token)

    assert validated is not None
    assert validated.user_id == user.id


def test_invalidate_session(db_session):
    """Test session invalidation."""
    # Create user and session
    user = UserService.create_user(
        db=db_session,
        email="test@example.com",
        password="password123",
        name="Test User",
        os="Ubuntu",
        gpu="None",
    )

    session = AuthService.create_session(db=db_session, user_id=user.id)

    # Invalidate session
    success = AuthService.invalidate_session(db=db_session, session_token=session.session_token)

    assert success is True

    # Verify session is no longer valid
    validated = AuthService.validate_session(db=db_session, session_token=session.session_token)
    assert validated is None
