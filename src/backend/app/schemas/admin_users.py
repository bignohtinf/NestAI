from datetime import date, datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class UserSummary(BaseModel):
    id: str
    email: str
    name: str # Mapping from full_name
    role: str
    status: str # Mapping from is_active (active/inactive)
    createdAt: datetime
    lastLogin: Optional[datetime]
    activeStatus: bool

class UserListResponse(BaseModel):
    users: List[UserSummary]
    total: int
    limit: int
    offset: int

class UserStats(BaseModel):
    totalConversations: int
    totalMessagesChat: int
    nutritionAdherence: float

class UserDetail(BaseModel):
    id: str
    email: str
    name: str
    role: str
    status: str
    avatar: Optional[str]
    createdAt: datetime
    lastLogin: Optional[datetime]
    preferences: Dict
    stats: UserStats

class UserDetailResponse(BaseModel):
    user: UserDetail

class MedicalProfileSummary(BaseModel):
    id: str
    userId: str
    userName: str
    pregnancyStatus: str
    trimester: Optional[int]
    weekOfPregnancy: Optional[int]
    dueDate: Optional[date]
    prePregnancyWeight: Optional[float]
    currentWeight: Optional[float]
    weightGain: Optional[float]
    heightCm: Optional[float]
    bmi: Optional[float]
    bloodType: Optional[str]
    chronicDiseases: List[str]
    allergies: List[str]
    medicalHistory: Optional[str]
    lastCheckupDate: Optional[date]
    nextCheckupDate: Optional[date]

class MedicalProfileListResponse(BaseModel):
    profiles: List[MedicalProfileSummary]
    total: int
    limit: int
    offset: int
