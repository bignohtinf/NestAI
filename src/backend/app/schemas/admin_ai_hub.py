from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class AlgorithmConfigSummary(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str
    currentVersion: str = Field(..., alias="current_version")
    accuracy: Optional[float] = None
    avgResponseTimeMs: Optional[int] = Field(None, alias="avg_response_time_ms")
    lastUpdated: datetime = Field(..., alias="updated_at")

class AlgorithmConfigDetail(AlgorithmConfigSummary):
    configJson: Dict = Field(..., alias="config_json")
    callsThisMonth: int = Field(0, alias="calls_this_month")
    successRate: Optional[float] = Field(None, alias="success_rate")
    lastTrainingDate: Optional[datetime] = Field(None, alias="last_training_date")

class AlgorithmConfigUpdate(BaseModel):
    status: Optional[str] = None
    configJson: Optional[Dict] = Field(None, alias="config_json")
    modelVersion: Optional[str] = Field(None, alias="current_version")

class RAGDocumentBase(BaseModel):
    title: str
    content: str
    category: Literal["nutrition", "pregnancy", "general", "medical", "postpartum"]
    source: Optional[str] = None
    sourceUrl: Optional[str] = Field(None, alias="source_url")
    language: str = "vi"
    status: str = "active"

    class Config:
        populate_by_name = True

class RAGDocumentCreate(RAGDocumentBase):
    pass

class RAGDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None

class RAGDocumentSummary(RAGDocumentBase):
    id: str
    tokensCount: Optional[int] = Field(None, alias="tokens_count")
    usageCount: int = Field(0, alias="usage_count")
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")

class RAGDocumentListResponse(BaseModel):
    documents: List[RAGDocumentSummary]
    total: int
    limit: int
    offset: int

class TokenUsageTrend(BaseModel):
    date: str # ISO date
    tokens: int
    cost: float

class ModelPerformance(BaseModel):
    accuracy: float
    latency: int
    errorRate: float

class MonitoringStats(BaseModel):
    totalTokens: int
    avgLatency: float
    successRate: float

class MonitoringResponse(BaseModel):
    stats: MonitoringStats
    tokenHistory: List[TokenUsageTrend]
    modelStats: List[Dict[str, Any]]
    modelPerformance: Dict[str, ModelPerformance]
    quotaLimit: Dict
    alerts: List[Dict]

# ─── Log Schemas (Phase 2B) ──────────────────────────────────────────────

class ChatLogSummary(BaseModel):
    id: str
    userId: str = Field(..., alias="user_id")
    title: str
    createdAt: datetime = Field(..., alias="created_at")
    updatedAt: datetime = Field(..., alias="updated_at")
    userName: Optional[str] = Field(None, alias="user_name")
    userEmail: Optional[str] = Field(None, alias="user_email")

    class Config:
        populate_by_name = True

class ChatLogListResponse(BaseModel):
    logs: List[ChatLogSummary]
    total: int
    limit: int
    offset: int

class ScanLogSummary(BaseModel):
    id: str
    userId: str = Field(..., alias="user_id")
    mealName: str = Field(..., alias="meal_name")
    calories: float
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    imageUrl: Optional[str] = Field(None, alias="image_url")
    createdAt: datetime = Field(..., alias="created_at")
    userName: Optional[str] = Field(None, alias="user_name")
    userEmail: Optional[str] = Field(None, alias="user_email")

    class Config:
        populate_by_name = True

class ScanLogListResponse(BaseModel):
    logs: List[ScanLogSummary]
    total: int
    limit: int
    offset: int

class RecommendationLogSummary(BaseModel):
    id: str
    userId: str = Field(..., alias="user_id")
    planDate: str = Field(..., alias="plan_date")
    target: str
    createdAt: datetime = Field(..., alias="created_at")
    userName: Optional[str] = Field(None, alias="user_name")
    userEmail: Optional[str] = Field(None, alias="user_email")

    class Config:
        populate_by_name = True

class RecommendationLogListResponse(BaseModel):
    logs: List[RecommendationLogSummary]
    total: int
    limit: int
    offset: int
