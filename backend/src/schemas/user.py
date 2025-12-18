"""User request/response schemas."""
from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    name: str
    os: str
    gpu: str
    experience_level: str
    robotics_background: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""
    password: str


class UserUpdate(BaseModel):
    """User update schema."""
    name: Optional[str] = None
    os: Optional[str] = None
    gpu: Optional[str] = None
    experience_level: Optional[str] = None
    robotics_background: Optional[str] = None


class UserResponse(UserBase):
    """User response schema."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True
