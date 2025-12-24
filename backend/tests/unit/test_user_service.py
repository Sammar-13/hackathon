"""Tests for user service."""
import pytest
from src.services.user_service import UserService
from src.models.user import ExperienceLevel


def test_create_user(db_session):
    """Test user creation."""
    user = UserService.create_user(
        db=db_session,
        email="test@example.com",
        password="password123",
        name="Test User",
        os="Ubuntu",
        gpu="None",
        experience_level=ExperienceLevel.BEGINNER,
    )

    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert user.experience_level == ExperienceLevel.BEGINNER


def test_create_duplicate_user(db_session):
    """Test that duplicate users are rejected."""
    UserService.create_user(
        db=db_session,
        email="test@example.com",
        password="password123",
        name="Test User",
        os="Ubuntu",
        gpu="None",
    )

    with pytest.raises(ValueError):
        UserService.create_user(
            db=db_session,
            email="test@example.com",
            password="password123",
            name="Another User",
            os="Ubuntu",
            gpu="None",
        )


def test_verify_password():
    """Test password verification."""
    password = "mypassword"
    hash_val = UserService.pwd_context.hash(password)

    assert UserService.verify_password(password, hash_val) is True
    assert UserService.verify_password("wrongpassword", hash_val) is False
