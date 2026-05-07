from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import date
from enum import Enum

class AnalyticsPeriod(str, Enum):
    week = "week"
    month = "month"
    quarter = "quarter"
    year = "year"

class UserTrend(BaseModel):
    date: date
    newUsers: int
    activeUsers: int

class UserAnalyticsResponse(BaseModel):
    totalUsers: int
    newUsersThisPeriod: int
    activeUsersThisPeriod: int
    usersByRole: Dict[str, int]
    retentionRate: float
    churnRate: float
    trends: List[UserTrend]

class ChatTrend(BaseModel):
    date: date
    conversations: int
    messages: int

class ChatAnalyticsResponse(BaseModel):
    totalConversations: int
    totalMessages: int
    avgMessagesPerConversation: float
    avgDurationSeconds: float
    topTopics: List[str]
    satisfactionScore: float
    trends: List[ChatTrend]

class PregnancyStats(BaseModel):
    totalPregnancies: int
    ongoingTrimesters: Dict[str, int]
    avgHealthScore: float

class HealthCheckIns(BaseModel):
    thisMonth: int
    compliance: float

class CommunityMetrics(BaseModel):
    avgNutritionAdherence: float
    avgActivityLevel: float
    avgMealQuality: float

class HealthAlert(BaseModel):
    type: str
    count: int

class HealthAnalyticsResponse(BaseModel):
    pregnancyTracking: PregnancyStats
    healthCheckIns: HealthCheckIns
    communityMetrics: CommunityMetrics
    alerts: List[HealthAlert]
