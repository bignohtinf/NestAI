from datetime import datetime, timedelta
from typing import Optional
from postgrest import SyncRequestBuilder
from app.schemas.admin_analytics import (
    AnalyticsPeriod, 
    UserAnalyticsResponse, 
    ChatAnalyticsResponse, 
    HealthAnalyticsResponse
)

class AdminAnalyticsService:
    def __init__(self, supabase):
        self.supabase = supabase

    def get_user_analytics(self, period: AnalyticsPeriod, role: Optional[str] = None) -> UserAnalyticsResponse:
        # Calculate date range
        now = datetime.utcnow()
        if period == AnalyticsPeriod.week:
            days = 7
        elif period == AnalyticsPeriod.month:
            days = 30
        elif period == AnalyticsPeriod.quarter:
            days = 90
        else: # year
            days = 365
        
        start_date = (now - timedelta(days=days)).isoformat()

        # 1. Total users count (correct fields: is_active)
        users_query = self.supabase.table("users").select("id, role, is_active, created_at, last_login")
        if role:
            users_query = users_query.eq("role", role)
        
        users_res = users_query.execute()
        all_users = users_res.data or []
        
        total_users = len(all_users)
        new_users = len([u for u in all_users if u["created_at"] >= start_date])
        active_users_period = len([u for u in all_users if u["last_login"] and u["last_login"] >= start_date])
        
        # Role distribution
        roles = {}
        for u in all_users:
            r = u["role"]
            roles[r] = roles.get(r, 0) + 1

        # Trends using the DB function created in Migration 018
        trends_res = self.supabase.rpc("get_user_growth_trend", {"days_back": days}).execute()
        trends_data = []
        if trends_res.data:
            for item in trends_res.data:
                trends_data.append({
                    "date": item["trend_date"],
                    "newUsers": item["new_users"],
                    "activeUsers": item["active_users"]
                })

        return UserAnalyticsResponse(
            totalUsers=total_users,
            newUsersThisPeriod=new_users,
            activeUsersThisPeriod=active_users_period,
            usersByRole=roles,
            retentionRate=85.5, # Mock for now
            churnRate=3.2,      # Mock for now
            trends=trends_data
        )

    def get_chat_analytics(self, period: AnalyticsPeriod) -> ChatAnalyticsResponse:
        if period == AnalyticsPeriod.week:
            days = 7
        elif period == AnalyticsPeriod.month:
            days = 30
        elif period == AnalyticsPeriod.quarter:
            days = 90
        else: # year
            days = 365

        # Aggregate stats from conversations and messages
        convs_res = self.supabase.table("conversations").select("id", count="exact").execute()
        msgs_res = self.supabase.table("messages").select("id", count="exact").execute()
        
        total_convs = convs_res.count or 0
        total_msgs = msgs_res.count or 0
        
        # Trends using DB function from Migration 018
        trends_res = self.supabase.rpc("get_chat_stats_trend", {"days_back": days}).execute()
        trends_data = []
        if trends_res.data:
            for item in trends_res.data:
                trends_data.append({
                    "date": item["trend_date"],
                    "conversations": item["conversations"],
                    "messages": item["messages"]
                })

        return ChatAnalyticsResponse(
            totalConversations=total_convs,
            totalMessages=total_msgs,
            avgMessagesPerConversation=round(total_msgs / total_convs, 1) if total_convs > 0 else 0,
            avgDurationSeconds=420, # Mock
            topTopics=["dinh dưỡng", "thai kỳ", "chế độ ăn"], # Mock
            satisfactionScore=4.2, # Mock
            trends=trends_data
        )

    def get_health_analytics(self, period: AnalyticsPeriod) -> HealthAnalyticsResponse:
        # Query from medical_profiles table (Migration 013)
        mp_res = self.supabase.table("medical_profiles").select("pregnancy_status, trimester").execute()
        profiles = mp_res.data or []
        
        total_preg = len([p for p in profiles if p["pregnancy_status"] == "pregnant"])
        trimesters = {"1st": 0, "2nd": 0, "3rd": 0}
        for p in profiles:
            if p["pregnancy_status"] == "pregnant" and p["trimester"]:
                key = f"{p['trimester']}st" if p['trimester'] == 1 else (f"{p['trimester']}nd" if p['trimester'] == 2 else f"{p['trimester']}rd")
                trimesters[key] = trimesters.get(key, 0) + 1

        return HealthAnalyticsResponse(
            pregnancyTracking={
                "totalPregnancies": total_preg,
                "ongoingTrimesters": trimesters,
                "avgHealthScore": 8.2
            },
            healthCheckIns={
                "thisMonth": 450,
                "compliance": 78.5
            },
            communityMetrics={
                "avgNutritionAdherence": 82.3,
                "avgActivityLevel": 6.5,
                "avgMealQuality": 7.8
            },
            alerts=[
                {"type": "malnutrition_risk", "count": 5},
                {"type": "low_activity", "count": 12}
            ]
        )
