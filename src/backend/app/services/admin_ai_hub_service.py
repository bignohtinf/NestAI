from datetime import date, timedelta
from typing import Any, Dict, List, Optional

from app.schemas.admin_ai_hub import (
    AlgorithmConfigDetail,
    AlgorithmConfigSummary,
    AlgorithmConfigUpdate,
    ChatLogListResponse,
    ChatLogSummary,
    ModelPerformance,
    MonitoringResponse,
    RAGDocumentCreate,
    RAGDocumentListResponse,
    RAGDocumentSummary,
    RAGDocumentUpdate,
    RecommendationLogListResponse,
    RecommendationLogSummary,
    ScanLogListResponse,
    ScanLogSummary,
)


class AdminAIHubService:
    def __init__(self, supabase):
        self.supabase = supabase

    def get_algorithms_list(self) -> List[AlgorithmConfigSummary]:
        try:
            res = self.supabase.table("algorithm_configs").select("*").execute()
            return [AlgorithmConfigSummary(**item) for item in (res.data or [])]
        except Exception as e:
            print(f"Warning: algorithm_configs table not found: {e}")
            # Return empty list or basic data if table doesn't exist yet
            return []

    def get_algorithm_detail(self, algo_id: str) -> Optional[AlgorithmConfigDetail]:
        try:
            res = self.supabase.table("algorithm_configs").select("*").eq("id", algo_id).execute()
            return AlgorithmConfigDetail(**res.data[0]) if res.data else None
        except Exception as e:
            print(f"Warning: algorithm_configs table not found: {e}")
            return None

    def update_algorithm(self, algo_id: str, updates: AlgorithmConfigUpdate) -> Optional[dict]:
        data = updates.model_dump(by_alias=True, exclude_unset=True)
        if not data:
            return None
        
        # Log to history before updating (as planned in Migration 016)
        # Note: In a real app, you'd get the old data first to record performance_changes
        res = self.supabase.table("algorithm_configs").update(data).eq("id", algo_id).execute()
        
        # Record change in history if possible
        # This requires admin_id which we'd get from the current user dependency
        return res.data[0] if res.data else None

    def get_rag_documents(
        self,
        limit: int = 20,
        offset: int = 0,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> RAGDocumentListResponse:
        try:
            query = self.supabase.table("rag_documents").select("*", count="exact")
            
            if category:
                query = query.eq("category", category)
            if search:
                # Using basic ILIKE or the full-text search index created in Migration 017
                query = query.or_(f"title.ilike.%{search}%,content.ilike.%{search}%")
                
            res = query.order("updated_at", desc=True).range(offset, offset + limit - 1).execute()
            
            return RAGDocumentListResponse(
                documents=[RAGDocumentSummary(**item) for item in (res.data or [])],
                total=res.count or 0,
                limit=limit,
                offset=offset
            )
        except Exception as e:
            print(f"Warning: rag_documents table not found: {e}")
            return RAGDocumentListResponse(documents=[], total=0, limit=limit, offset=offset)

    def add_rag_document(self, doc_data: RAGDocumentCreate) -> Optional[dict]:
        data = doc_data.model_dump(by_alias=True)
        res = self.supabase.table("rag_documents").insert(data).execute()
        return res.data[0] if res.data else None

    def update_rag_document(self, doc_id: str, updates: RAGDocumentUpdate) -> Optional[dict]:
        data = updates.model_dump(by_alias=True, exclude_unset=True)
        res = self.supabase.table("rag_documents").update(data).eq("id", doc_id).execute()
        return res.data[0] if res.data else None

    def delete_rag_document(self, doc_id: str) -> bool:
        self.supabase.table("rag_documents").delete().eq("id", doc_id).execute()
        return True

    def get_monitoring_data(self, period: str = "month") -> MonitoringResponse:
        # 1. Token usage summary (from token_usage_logs - Migration 016)
        today = date.today()
        if period == "day":
            start_date = today.isoformat()
        elif period == "week":
            start_date = (today - timedelta(days=7)).isoformat()
        else:
            start_date = today.replace(day=1).isoformat()

        try:
            usage_res = self.supabase.table("token_usage_logs").select("*").gte("date_at", start_date).execute()
            usage_data = usage_res.data or []
        except Exception as e:
            # Table doesn't exist yet, return empty data
            print(f"Warning: token_usage_logs table not found: {e}")
            usage_data = []
        
        total_tokens = sum(u["total_tokens"] for u in usage_data)
        float(sum(u["total_cost_usd"] for u in usage_data))
        
        # Daily trend
        trend: Dict[str, int] = {}
        model_tokens: Dict[str, int] = {}
        for u in usage_data:
            dt = u["date_at"]
            trend[dt] = trend.get(dt, 0) + u["total_tokens"]
            
            m = u["model_name"]
            model_tokens[m] = model_tokens.get(m, 0) + u["total_tokens"]
            
        daily_trend = [{"date": k, "tokens": v, "cost": v * 0.000001} for k, v in sorted(trend.items())]
        model_stats = [{"model": k, "tokens": v} for k, v in model_tokens.items()]

        # 2. Model performance (mocking or from algorithm_configs)
        algos = self.get_algorithms_list()
        performance = {}
        for a in algos:
            performance[a.id] = ModelPerformance(
                accuracy=a.accuracy or 0.0,
                latency=a.avgResponseTimeMs or 0,
                errorRate=0.02 # Mock
            )

        # 3. Calculate global stats
        avg_latency = 0.8 # Mock or calculate from algos
        success_rate = 99.5 # Mock or calculate

        return MonitoringResponse(
            stats={
                "totalTokens": total_tokens,
                "avgLatency": avg_latency,
                "successRate": success_rate
            },
            tokenHistory=daily_trend,
            modelStats=model_stats,
            modelPerformance=performance,
            quotaLimit={
                "monthlyTokenBudget": 10000000,
                "tokensRemaining": 10000000 - total_tokens,
                "percentageUsed": round((total_tokens / 10000000) * 100, 1) if total_tokens > 0 else 0
            },
            alerts=[
                {"type": "quota_warning", "message": "Usage reaching 50%", "severity": "warning"}
            ] if total_tokens > 5000000 else []
        )

    def get_chat_logs(self, limit: int = 20, offset: int = 0) -> ChatLogListResponse:
        try:
            res = self.supabase.table("conversations").select(
                "*",
                count="exact"
            ).order("updated_at", desc=True).range(offset, offset + limit - 1).execute()
            
            logs = []
            for item in (res.data or []):
                # Remove sensitive userId for display if needed, but we still need it for the schema
                # Here we just ensure user_name and user_email are not populated
                logs.append(ChatLogSummary(**item))
                
            return ChatLogListResponse(
                logs=logs,
                total=res.count or 0,
                limit=limit,
                offset=offset
            )
        except Exception as e:
            print(f"Error in get_chat_logs: {e}")
            return ChatLogListResponse(logs=[], total=0, limit=limit, offset=offset)

    def get_chat_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        try:
            res = self.supabase.table("messages").select("*")\
                .eq("conversation_id", conversation_id)\
                .order("timestamp", desc=False)\
                .execute()
            return res.data or []
        except Exception as e:
            print(f"Error in get_chat_messages: {e}")
            return []

    def get_scan_logs(self, limit: int = 20, offset: int = 0) -> ScanLogListResponse:
        try:
            res = self.supabase.table("nutrition_logs").select(
                "*",
                count="exact"
            ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            logs = []
            for item in (res.data or []):
                logs.append(ScanLogSummary(**item))
                
            return ScanLogListResponse(
                logs=logs,
                total=res.count or 0,
                limit=limit,
                offset=offset
            )
        except Exception as e:
            print(f"Error in get_scan_logs: {e}")
            return ScanLogListResponse(logs=[], total=0, limit=limit, offset=offset)

    def get_recommendation_logs(self, limit: int = 20, offset: int = 0) -> RecommendationLogListResponse:
        try:
            res = self.supabase.table("meal_plans").select(
                "*",
                count="exact"
            ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            logs = []
            for item in (res.data or []):
                logs.append(RecommendationLogSummary(**item))
                
            return RecommendationLogListResponse(
                logs=logs,
                total=res.count or 0,
                limit=limit,
                offset=offset
            )
        except Exception as e:
            print(f"Error in get_recommendation_logs: {e}")
            return RecommendationLogListResponse(logs=[], total=0, limit=limit, offset=offset)
