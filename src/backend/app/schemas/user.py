from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    phone: Optional[str] = None
    dob: Optional[str] = None
    allergies: Optional[list[str]] = None
    dislikes: Optional[list[str]] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    phone: Optional[str] = None
    dob: Optional[str] = None
    allergies: Optional[list[str]] = None
    dislikes: Optional[list[str]] = None
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
