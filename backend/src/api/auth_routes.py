"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.auth import SignupRequest, SigninRequest, AuthResponse, SessionValidationResponse
from ..schemas.user import UserResponse
from ..services.user_service import UserService
from ..services.auth_service import AuthService
from ..models.user import ExperienceLevel

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
async def signup(
    request: SignupRequest,
    db: Session = Depends(get_db)
):
    """Sign up a new user."""
    try:
        # Create user
        user = UserService.create_user(
            db=db,
            email=request.email,
            password=request.password,
            name=request.name,
            os=request.os,
            gpu=request.gpu,
            experience_level=ExperienceLevel(request.experience_level),
            robotics_background=request.robotics_background,
        )

        # Create session
        session = AuthService.create_session(db=db, user_id=user.id)

        return AuthResponse(
            session_token=session.session_token,
            user_id=str(user.id),
            email=user.email,
            name=user.name,
            experience_level=user.experience_level.value,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Signup failed")


@router.post("/signin", response_model=AuthResponse)
async def signin(
    request: SigninRequest,
    db: Session = Depends(get_db)
):
    """Sign in an existing user."""
    try:
        # Find user by email
        user = UserService.get_user_by_email(db=db, email=request.email)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Verify password
        if not UserService.verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Create session
        session = AuthService.create_session(db=db, user_id=user.id)

        return AuthResponse(
            session_token=session.session_token,
            user_id=str(user.id),
            email=user.email,
            name=user.name,
            experience_level=user.experience_level.value,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Sign in failed")


@router.post("/signout")
async def signout(
    authorization: str = None,
    db: Session = Depends(get_db)
):
    """Sign out a user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")

    session_token = authorization[7:]  # Remove "Bearer " prefix

    if not AuthService.invalidate_session(db=db, session_token=session_token):
        raise HTTPException(status_code=401, detail="Invalid session")

    return {"status": "signed out"}


@router.get("/validate", response_model=SessionValidationResponse)
async def validate_session(
    authorization: str = None,
    db: Session = Depends(get_db)
):
    """Validate a session token."""
    if not authorization or not authorization.startswith("Bearer "):
        return SessionValidationResponse(is_valid=False)

    session_token = authorization[7:]  # Remove "Bearer " prefix

    user = AuthService.get_user_from_session(db=db, session_token=session_token)

    if not user:
        return SessionValidationResponse(is_valid=False)

    # Update activity
    AuthService.update_session_activity(db=db, session_token=session_token)

    return SessionValidationResponse(
        is_valid=True,
        user_id=str(user.id),
        email=user.email,
        name=user.name,
    )
