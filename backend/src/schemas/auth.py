"""Authentication request/response schemas."""
from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    """Signup request schema."""
    email: EmailStr
    password: str
    name: str
    os: str
    gpu: str
    experience_level: str
    robotics_background: str = None


class SigninRequest(BaseModel):
    """Signin request schema."""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Authentication response schema."""
    session_token: str
    user_id: str
    email: str
    name: str
    experience_level: str


class SessionValidationResponse(BaseModel):
    """Session validation response schema."""
    is_valid: bool
    user_id: str = None
    email: str = None
    name: str = None
