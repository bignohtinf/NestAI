from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class CMSItemBase(BaseModel):
    type: Literal["post", "notification", "alert", "announcement"]
    title: str
    content: str
    thumbnailUrl: Optional[str] = Field(None, alias="thumbnail_url")
    slug: Optional[str] = None
    status: str = "draft"
    publishedAt: Optional[datetime] = Field(None, alias="published_at")
    expiresAt: Optional[datetime] = Field(None, alias="expires_at")
    targetRole: Optional[str] = Field(None, alias="target_role")
    targetPregnancyStatus: Optional[str] = Field(None, alias="target_pregnancy_status")
    seoTitle: Optional[str] = Field(None, alias="seo_title")
    seoDescription: Optional[str] = Field(None, alias="seo_description")

    class Config:
        populate_by_name = True

class CMSItemCreate(CMSItemBase):
    pass

class CMSItemUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    thumbnailUrl: Optional[str] = Field(None, alias="thumbnail_url")
    status: Optional[str] = None
    publishedAt: Optional[datetime] = Field(None, alias="published_at")
    targetRole: Optional[str] = Field(None, alias="target_role")

    class Config:
        populate_by_name = True

class CMSItemSummary(CMSItemBase):
    id: str
    viewCount: int = Field(0, alias="view_count")
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")
    authorEmail: Optional[str] = None # Will join from users

class CMSItemListResponse(BaseModel):
    items: List[CMSItemSummary]
    total: int
    limit: int
    offset: int

class SystemSettingsResponse(BaseModel):
    settings: Dict[str, Any]

class AuditLogSummary(BaseModel):
    id: str
    adminId: str = Field(..., alias="admin_id")
    action: str
    targetType: Optional[str] = Field(None, alias="target_type")
    targetId: Optional[str] = Field(None, alias="target_id")
    details: Optional[Dict] = None
    oldValues: Optional[Dict] = Field(None, alias="old_values")
    newValues: Optional[Dict] = Field(None, alias="new_values")
    ipAddress: Optional[str] = Field(None, alias="ip_address")
    userAgent: Optional[str] = Field(None, alias="user_agent")
    success: bool = True
    createdAt: datetime = Field(..., alias="created_at")
    adminEmail: Optional[str] = None # Will join

class AuditLogListResponse(BaseModel):
    logs: List[AuditLogSummary]
    total: int
    limit: int
    offset: int
