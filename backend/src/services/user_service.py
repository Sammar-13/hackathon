"""User service for managing user accounts."""
from uuid import UUID
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..models.user import User, ExperienceLevel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """Service for user management."""

    @staticmethod
    def create_user(
        db: Session,
        email: str,
        password: str,
        name: str,
        os: str,
        gpu: str,
        experience_level: ExperienceLevel = ExperienceLevel.BEGINNER,
        robotics_background: str = None,
    ) -> User:
        """Create a new user."""
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise ValueError(f"User with email {email} already exists")

        # Hash password
        hashed_password = pwd_context.hash(password)

        # Create user
        user = User(
            email=email,
            password_hash=hashed_password,
            name=name,
            os=os,
            gpu=gpu,
            experience_level=experience_level,
            robotics_background=robotics_background,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: UUID) -> User | None:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def update_user_profile(
        db: Session,
        user_id: UUID,
        name: str = None,
        os: str = None,
        gpu: str = None,
        experience_level: ExperienceLevel = None,
        robotics_background: str = None,
    ) -> User:
        """Update user profile."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with ID {user_id} not found")

        if name:
            user.name = name
        if os:
            user.os = os
        if gpu:
            user.gpu = gpu
        if experience_level:
            user.experience_level = experience_level
        if robotics_background is not None:
            user.robotics_background = robotics_background

        db.commit()
        db.refresh(user)
        return user
