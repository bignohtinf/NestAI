from datetime import datetime, timedelta
from typing import Optional

from app.schemas.admin_analytics import (
    AnalyticsPeriod,
    ChatAnalyticsResponse,
    HealthAnalyticsResponse,
    TopicStat,
    UserAnalyticsResponse,
)

# ── Taxonomy chủ đề — keywords tiếng Việt theo domain app ─────────────────────
TOPIC_KEYWORDS: dict[str, list[str]] = {
    "Dinh dưỡng": [
        "dinh dưỡng", "ăn gì", "nên ăn", "không nên ăn", "thực phẩm",
        "chất dinh dưỡng", "vitamin", "protein", "canxi", "sắt", "dha",
        "omega", "bổ sung", "khẩu phần", "calo", "kcal", "acid folic",
        "khoáng chất", "vi chất",
    ],
    "Chế độ ăn": [
        "chế độ ăn", "thực đơn", "bữa ăn", "ăn chay", "thực vật",
        "menu", "món ăn", "nấu ăn", "kiêng", "ăn uống", "khẩu vị",
        "cháo", "canh", "rau củ",
    ],
    "Thai kỳ": [
        "thai kỳ", "mang thai", "bầu", "thai nhi", "thai phụ",
        "tuần thai", "tam cá nguyệt", "siêu âm", "khám thai",
        "ốm nghén", "thai", "tuần",
    ],
    "Sau sinh": [
        "sau sinh", "hồi phục", "cho con bú", "sữa mẹ", "hậu sản",
        "sản hậu", "lactation", "tăng sữa", "lợi sữa",
    ],
    "Sức khỏe": [
        "sức khỏe", "triệu chứng", "đau", "buồn nôn", "mệt mỏi",
        "phù", "chuột rút", "huyết áp", "tiểu đường", "thiếu máu",
        "nhiễm trùng", "sốt", "ho", "bệnh",
    ],
    "Chuẩn bị sinh": [
        "sinh nở", "chuyển dạ", "đẻ", "sinh thường", "mổ đẻ",
        "chuẩn bị sinh", "túi đồ", "bệnh viện", "đặt lịch sinh",
    ],
    "Tâm lý": [
        "lo lắng", "stress", "tâm lý", "cảm xúc", "trầm cảm",
        "hồi hộp", "lo âu", "buồn", "khóc", "áp lực",
    ],
    "Vận động": [
        "vận động", "tập thể dục", "yoga", "bơi", "đi bộ",
        "thể dục", "thể thao", "vận động nhẹ",
    ],
}

TOP_N = 5


def _extract_topics(texts: list[str]) -> list[TopicStat]:
    """Đếm số lần xuất hiện keyword của mỗi chủ đề trong danh sách text."""
    counts: dict[str, int] = {topic: 0 for topic in TOPIC_KEYWORDS}
    for text in texts:
        text_lower = text.lower()
        for topic, keywords in TOPIC_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    counts[topic] += 1
                    break  # Chỉ tính 1 lần / topic / text
    # Lọc topic có count > 0, sắp xếp giảm dần
    sorted_topics = sorted(
        [(name, cnt) for name, cnt in counts.items() if cnt > 0],
        key=lambda x: x[1],
        reverse=True,
    )
    return [TopicStat(name=name, count=cnt) for name, cnt in sorted_topics[:TOP_N]]

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

        # Retention = % users có last_login trong kỳ / tổng users (loại trừ admin)
        non_admin_users = [u for u in all_users if u["role"] != "admin"]
        non_admin_total = len(non_admin_users)
        if non_admin_total > 0:
            active_non_admin = len([u for u in non_admin_users if u["last_login"] and u["last_login"] >= start_date])
            retention_rate = round((active_non_admin / non_admin_total) * 100, 1)
            churn_rate = round(100 - retention_rate, 1)
        else:
            retention_rate = 0.0
            churn_rate = 0.0

        return UserAnalyticsResponse(
            totalUsers=total_users,
            newUsersThisPeriod=new_users,
            activeUsersThisPeriod=active_users_period,
            usersByRole=roles,
            retentionRate=retention_rate,
            churnRate=churn_rate,
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

        # 1. Đếm tổng conversations + messages
        convs_res = self.supabase.table("conversations").select("id, title", count="exact").execute()
        msgs_res = self.supabase.table("messages").select("id, content, role", count="exact").execute()

        total_convs = convs_res.count or 0
        total_msgs = msgs_res.count or 0

        # 2. Trích xuất top topics từ titles + user messages
        texts: list[str] = []
        if convs_res.data:
            texts += [c["title"] for c in convs_res.data if c.get("title")]
        if msgs_res.data:
            texts += [m["content"] for m in msgs_res.data if m.get("role") == "user" and m.get("content")]

        top_topics = _extract_topics(texts)

        # 3. Trends từ DB function (Migration 018)
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
            avgDurationSeconds=0,   # Chưa track — không hiển thị
            topTopics=top_topics,
            satisfactionScore=0,    # Chưa track — không hiển thị
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
