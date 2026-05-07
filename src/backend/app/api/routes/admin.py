from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime, timedelta

from app.schemas.admin_analytics import AnalyticsPeriod, UserAnalyticsResponse, ChatAnalyticsResponse, HealthAnalyticsResponse
from app.schemas.admin_users import UserListResponse, UserDetailResponse, MedicalProfileListResponse
from app.schemas.admin_stores import StoreCreate, StoreUpdate, StoreListResponse, StoreFoodMappingCreate, StoreFoodMappingListResponse, StoreLocationsResponse
from app.schemas.admin_ai_hub import (
    AlgorithmConfigSummary, 
    AlgorithmConfigDetail, 
    AlgorithmConfigUpdate, 
    RAGDocumentCreate, 
    RAGDocumentUpdate, 
    RAGDocumentListResponse, 
    MonitoringResponse,
    ChatLogListResponse,
    ScanLogListResponse,
    RecommendationLogListResponse
)
from app.schemas.admin_system import CMSItemCreate, CMSItemUpdate, CMSItemListResponse, SystemSettingsResponse, AuditLogListResponse
from app.services.admin_analytics_service import AdminAnalyticsService
from app.services.admin_users_service import AdminUsersService
from app.services.admin_stores_service import AdminStoresService
from app.services.admin_ai_hub_service import AdminAIHubService
from app.services.admin_system_service import AdminSystemService

router = APIRouter()

class BudgetCreate(BaseModel):
    weekly_limit: float

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None

@router.get("/budget")
async def get_budget(user_id: str, supabase = Depends(get_supabase)):
    """Get current budget for a user"""
    # Placeholder - budgets table not yet created
    return {"budget": None, "expenses": [], "remaining": 0}

@router.post("/budget")
async def create_budget(user_id: str, budget_data: BudgetCreate, supabase = Depends(get_supabase)):
    """Create a new budget"""
    # Placeholder - budgets table not yet created
    raise HTTPException(status_code=501, detail="Budget feature not yet implemented")

@router.post("/expense")
async def add_expense(user_id: str, expense: ExpenseCreate, supabase = Depends(get_supabase)):
    """Add an expense to the current budget"""
    # Placeholder - expenses table not yet created
    raise HTTPException(status_code=501, detail="Expense feature not yet implemented")

@router.get("/expenses")
async def get_expenses(user_id: str, limit: int = 30, supabase = Depends(get_supabase)):
    """Get recent expenses"""
    # Placeholder - expenses table not yet created
    return {"expenses": []}

@router.get("/stats")
async def get_admin_stats(supabase = Depends(get_supabase)):
    """Get system statistics for admin dashboard"""
    try:
        # Query counts directly from tables for 100% accuracy
        # 1. Users count
        users_res = supabase.table("users").select("id, role", count="exact").execute()
        users_data = users_res.data or []
        total_users = users_res.count or len(users_data)
        
        # 2. Roles distribution
        total_admins = len([u for u in users_data if u.get("role") == "admin"])
        total_mothers = len([u for u in users_data if u.get("role") == "mother"])
        total_fathers = len([u for u in users_data if u.get("role") == "father"])
        
        # 3. Babies count (Count directly from babies table)
        babies_res = supabase.table("babies").select("id", count="exact").execute()
        total_babies = babies_res.count or len(babies_res.data or [])
        print(f"[DEBUG] Admin Stats - Direct Babies Count: {total_babies}")
        
        # 4. Partnerships
        partnerships_res = supabase.table("partnerships").select("id", count="exact").eq("status", "accepted").execute()
        total_partnerships = partnerships_res.count or len(partnerships_res.data or [])
        
        # 5. Conversations
        convs_res = supabase.table("conversations").select("id", count="exact").execute()
        total_convs = convs_res.count or len(convs_res.data or [])

        # 6. Active pregnancies
        preg_res = supabase.table("medical_profiles").select("id", count="exact").eq("pregnancy_status", "pregnant").execute()
        active_pregnancies = preg_res.count or len(preg_res.data or [])
        
        return {
            "totalUsers": total_users,
            "totalAdmins": total_admins,
            "totalMothers": total_mothers,
            "totalFathers": total_fathers,
            "activeUsers": total_users, # Mock or simplify
            "totalPartnerships": total_partnerships,
            "totalBabies": total_babies,
            "totalConversations": total_convs,
            "activePregnancies": active_pregnancies
        }
    except Exception as e:
        print(f"Error in get_admin_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ─── Analytics Endpoints (Phase 1A) ──────────────────────────────────────

@router.get("/analytics/users", response_model=UserAnalyticsResponse)
async def get_user_analytics(
    period: AnalyticsPeriod = AnalyticsPeriod.month,
    role: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    service = AdminAnalyticsService(supabase)
    return service.get_user_analytics(period, role)

@router.get("/analytics/chat", response_model=ChatAnalyticsResponse)
async def get_chat_analytics(
    period: AnalyticsPeriod = AnalyticsPeriod.month,
    supabase = Depends(get_supabase)
):
    service = AdminAnalyticsService(supabase)
    return service.get_chat_analytics(period)

@router.get("/analytics/health", response_model=HealthAnalyticsResponse)
async def get_health_analytics(
    period: AnalyticsPeriod = AnalyticsPeriod.month,
    supabase = Depends(get_supabase)
):
    service = AdminAnalyticsService(supabase)
    return service.get_health_analytics(period)

# ─── User Management Endpoints (Phase 1B) ──────────────────────────────────

@router.get("/users", response_model=UserListResponse)
async def get_users(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sortBy: str = "created_at",
    sortOrder: str = "desc",
    supabase = Depends(get_supabase)
):
    service = AdminUsersService(supabase)
    return service.get_users_list(limit, offset, role, status, search, sortBy, sortOrder)

@router.get("/users/medical-profiles", response_model=MedicalProfileListResponse)
async def get_medical_profiles(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    pregnancyStatus: Optional[str] = None,
    trimester: Optional[int] = Query(None, ge=1, le=3),
    search: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    service = AdminUsersService(supabase)
    return service.get_medical_profiles(limit, offset, pregnancyStatus, trimester, search)

@router.get("/users/{user_id}", response_model=UserDetailResponse)
async def get_user_detail(user_id: str, supabase = Depends(get_supabase)):
    service = AdminUsersService(supabase)
    detail = service.get_user_detail(user_id)
    if not detail:
        raise HTTPException(status_code=404, detail="User not found")
    return detail

@router.get("/users/{user_id}/medical-profile")
async def get_user_medical_profile(user_id: str, supabase = Depends(get_supabase)):
    service = AdminUsersService(supabase)
    res = supabase.table("medical_profiles").select("*").eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Medical profile not found for this user")
    return {"profile": res.data[0]}

# ─── Stores & Partners Endpoints (Phase 2A) ───────────────────────────────

@router.get("/stores", response_model=StoreListResponse)
async def get_stores(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    city: Optional[str] = None,
    district: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    service = AdminStoresService(supabase)
    return service.get_stores_list(limit, offset, city, district, search, status)

@router.post("/stores")
async def create_store(store_data: StoreCreate, supabase = Depends(get_supabase)):
    service = AdminStoresService(supabase)
    res = service.create_store(store_data)
    return {"success": True, "store": res}

@router.get("/stores/mapping", response_model=StoreFoodMappingListResponse)
async def get_store_mappings(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    storeId: Optional[str] = None,
    dishStt: Optional[int] = None,
    search: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    service = AdminStoresService(supabase)
    return service.get_mappings_list(limit, offset, storeId, dishStt, search)

@router.get("/stores/locations", response_model=StoreLocationsResponse)
async def get_store_locations(city: Optional[str] = None, supabase = Depends(get_supabase)):
    service = AdminStoresService(supabase)
    return service.get_store_locations(city)

@router.put("/stores/{store_id}")
async def update_store(store_id: str, store_data: StoreUpdate, supabase = Depends(get_supabase)):
    service = AdminStoresService(supabase)
    res = service.update_store(store_id, store_data)
    if not res:
        raise HTTPException(status_code=404, detail="Store not found")
    return {"success": True, "store": res}

@router.delete("/stores/{store_id}")
async def delete_store(store_id: str, supabase = Depends(get_supabase)):
    service = AdminStoresService(supabase)
    service.delete_store(store_id)
    return {"success": True}

@router.post("/stores/mapping")
async def add_store_mapping(mapping_data: StoreFoodMappingCreate, supabase = Depends(get_supabase)):
    service = AdminStoresService(supabase)
    res = service.add_mapping(mapping_data)
    return {"success": True, "mapping": res}

@router.delete("/stores/mapping/{mapping_id}")
async def delete_store_mapping(mapping_id: str, supabase = Depends(get_supabase)):
    service = AdminStoresService(supabase)
    service.delete_mapping(mapping_id)
    return {"success": True}

# ─── AI Hub Endpoints (Phase 2B) ──────────────────────────────────────────

@router.get("/ai-hub/algorithms", response_model=List[AlgorithmConfigSummary])
async def get_algorithms(supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    return service.get_algorithms_list()

@router.get("/ai-hub/algorithms/menu-recommendation", response_model=AlgorithmConfigDetail)
async def get_menu_recommendation_algo(supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    res = service.get_algorithm_detail("algo_menu_rec")
    if not res:
        raise HTTPException(status_code=404, detail="Algorithm config not found")
    return res

@router.put("/ai-hub/algorithms/menu-recommendation")
async def update_menu_recommendation_algo(updates: AlgorithmConfigUpdate, supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    res = service.update_algorithm("algo_menu_rec", updates)
    return {"success": True, "config": res}

@router.get("/ai-hub/algorithms/food-recognition", response_model=AlgorithmConfigDetail)
async def get_food_recognition_algo(supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    res = service.get_algorithm_detail("algo_food_rec")
    if not res:
        raise HTTPException(status_code=404, detail="Algorithm config not found")
    return res

@router.put("/ai-hub/algorithms/food-recognition")
async def update_food_recognition_algo(updates: AlgorithmConfigUpdate, supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    res = service.update_algorithm("algo_food_rec", updates)
    return {"success": True, "config": res}

@router.get("/ai-hub/rag", response_model=RAGDocumentListResponse)
async def get_rag_documents(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category: Optional[str] = None,
    search: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    service = AdminAIHubService(supabase)
    return service.get_rag_documents(limit, offset, category, search)

@router.post("/ai-hub/rag")
async def add_rag_document(doc: RAGDocumentCreate, supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    res = service.add_rag_document(doc)
    return {"success": True, "document": res}

@router.put("/ai-hub/rag/{doc_id}")
async def update_rag_document(doc_id: str, updates: RAGDocumentUpdate, supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    res = service.update_rag_document(doc_id, updates)
    if not res:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True, "document": res}

@router.delete("/ai-hub/rag/{doc_id}")
async def delete_rag_document(doc_id: str, supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    service.delete_rag_document(doc_id)
    return {"success": True}

@router.get("/ai-hub/monitoring", response_model=MonitoringResponse)
async def get_ai_monitoring(period: str = "month", supabase = Depends(get_supabase)):
    service = AdminAIHubService(supabase)
    return service.get_monitoring_data(period)

# ─── AI Logs Listing ──────────────────────────────────────────────────────

@router.get("/ai-logs/chat", response_model=ChatLogListResponse)
async def get_ai_chat_logs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    supabase = Depends(get_supabase)
):
    service = AdminAIHubService(supabase)
    return service.get_chat_logs(limit, offset)

@router.get("/ai-logs/chat/{chat_id}")
async def get_ai_chat_messages(
    chat_id: str,
    supabase = Depends(get_supabase)
):
    service = AdminAIHubService(supabase)
    messages = service.get_chat_messages(chat_id)
    return {"messages": messages}

@router.get("/ai-logs/scan", response_model=ScanLogListResponse)
async def get_ai_scan_logs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    supabase = Depends(get_supabase)
):
    service = AdminAIHubService(supabase)
    return service.get_scan_logs(limit, offset)

@router.get("/ai-logs/recommendations", response_model=RecommendationLogListResponse)
async def get_ai_recommendation_logs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    supabase = Depends(get_supabase)
):
    service = AdminAIHubService(supabase)
    return service.get_recommendation_logs(limit, offset)

# ─── System Endpoints (Phase 2C) ──────────────────────────────────────────

@router.get("/system/cms", response_model=CMSItemListResponse)
async def get_cms_items(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    service = AdminSystemService(supabase)
    return service.get_cms_items(limit, offset, type, status, search)

@router.post("/system/cms")
async def create_cms_item(item: CMSItemCreate, admin_id: str = "admin_001", supabase = Depends(get_supabase)):
    # Note: admin_id should come from auth dependency in production
    service = AdminSystemService(supabase)
    res = service.create_cms_item(item, admin_id)
    return {"success": True, "item": res}

@router.put("/system/cms/{item_id}")
async def update_cms_item(item_id: str, updates: CMSItemUpdate, supabase = Depends(get_supabase)):
    service = AdminSystemService(supabase)
    res = service.update_cms_item(item_id, updates)
    if not res:
        raise HTTPException(status_code=404, detail="CMS item not found")
    return {"success": True, "item": res}

@router.delete("/system/cms/{item_id}")
async def delete_cms_item(item_id: str, supabase = Depends(get_supabase)):
    service = AdminSystemService(supabase)
    service.delete_cms_item(item_id)
    return {"success": True}

@router.get("/system/settings", response_model=SystemSettingsResponse)
async def get_system_settings(supabase = Depends(get_supabase)):
    service = AdminSystemService(supabase)
    res = service.get_system_settings()
    return {"settings": res}

@router.put("/system/settings")
async def update_system_settings(settings: Dict[str, Dict], admin_id: str = "admin_001", supabase = Depends(get_supabase)):
    service = AdminSystemService(supabase)
    service.update_system_settings(settings, admin_id)
    return {"success": True}

@router.get("/system/audit-logs", response_model=AuditLogListResponse)
async def get_audit_logs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    action: Optional[str] = None,
    adminId: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    service = AdminSystemService(supabase)
    return service.get_audit_logs(limit, offset, action, adminId, dateFrom, dateTo)

@router.get("/spending-breakdown")
async def get_spending_breakdown(user_id: str, supabase = Depends(get_supabase)):
    """Get spending breakdown by category"""
    # Placeholder - expenses table not yet created
    return {
        "food": 0,
        "supplements": 0,
        "other": 0,
    }

# ─── Nutrition Database CRUD ──────────────────────────────────────────────

class DishCreate(BaseModel):
    stt: int
    dish_id: Optional[str] = None
    dish_name_vi: str
    dish_name_en: Optional[str] = None
    dish_type: str  # 'món mặn' | 'món rau' | 'món tinh bột' | 'món canh' | 'tráng miệng'
    group_name_vi: Optional[str] = None
    group_name_en: Optional[str] = None
    energy: float = 0
    protein: float = 0
    fat: float = 0
    carbohydrate: float = 0
    vitamin_a: float = 0
    beta_caroten: float = 0
    vitamin_c: float = 0
    calcium: float = 0
    iron: float = 0
    zinc: float = 0
    sodium: float = 0
    cholesterol: float = 0
    magnesium: float = 0
    transfat: float = 0
    price_vnd: Optional[float] = None  # Giá VNĐ/phần, None = chưa cập nhật

class DishUpdate(BaseModel):
    dish_name_vi: Optional[str] = None
    dish_name_en: Optional[str] = None
    dish_type: Optional[str] = None
    group_name_vi: Optional[str] = None
    energy: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    carbohydrate: Optional[float] = None
    vitamin_a: Optional[float] = None
    vitamin_c: Optional[float] = None
    calcium: Optional[float] = None
    iron: Optional[float] = None
    zinc: Optional[float] = None
    sodium: Optional[float] = None
    price_vnd: Optional[float] = None

class BulkDishUpload(BaseModel):
    dishes: list[DishCreate]

class ProfileCreate(BaseModel):
    stt: int
    age_group: Optional[str] = None
    gender: Optional[str] = None
    labor_level: Optional[str] = None
    physiological_condition: Optional[str] = None

class RecommendationCreate(BaseModel):
    profile_stt: int
    nutrient_name: str
    unit: Optional[str] = None
    value_str: str


@router.get("/nutrition-database")
async def get_nutrition_database(
    limit: int = 50,
    offset: int = 0,
    search: Optional[str] = None,
    dish_type: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    """Get nutrition database with search and filter."""
    try:
        query = supabase.table("nutrition_database").select(
            "id, stt, dish_id, dish_name_vi, dish_name_en, dish_type, "
            "group_name_vi, energy, protein, fat, carbohydrate, "
            "calcium, iron, zinc, vitamin_a, vitamin_c, sodium, price_vnd",
            count="exact"
        )

        if search:
            query = query.ilike("dish_name_vi", f"%{search}%")
        if dish_type:
            query = query.eq("dish_type", dish_type)

        result = query.order("stt").range(offset, offset + limit - 1).execute()

        return {
            "foods": result.data or [],
            "total": result.count or 0,
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/nutrition-database/{stt}")
async def get_nutrition_item(stt: int, supabase = Depends(get_supabase)):
    """Get a single dish by STT."""
    result = supabase.table("nutrition_database").select("*").eq("stt", stt).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Dish STT {stt} not found")
    return {"dish": result.data[0]}


@router.post("/nutrition-database")
async def add_nutrition_item(dish: DishCreate, supabase = Depends(get_supabase)):
    """Add a single dish to the nutrition database."""
    try:
        result = supabase.table("nutrition_database").upsert(
            dish.model_dump(), on_conflict="stt"
        ).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/nutrition-database/bulk")
async def bulk_upload_dishes(payload: BulkDishUpload, supabase = Depends(get_supabase)):
    """Bulk upsert dishes (for CSV seed from admin panel)."""
    try:
        rows = [d.model_dump() for d in payload.dishes]
        # Upsert in batches of 100
        inserted = 0
        for i in range(0, len(rows), 100):
            batch = rows[i:i+100]
            supabase.table("nutrition_database").upsert(batch, on_conflict="stt").execute()
            inserted += len(batch)
        return {"success": True, "count": inserted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk upload error: {str(e)}")


@router.put("/nutrition-database/{stt}")
async def update_nutrition_item(stt: int, updates: DishUpdate, supabase = Depends(get_supabase)):
    """Update a dish by STT (partial update)."""
    try:
        data = {k: v for k, v in updates.model_dump().items() if v is not None}
        if not data:
            raise HTTPException(status_code=400, detail="No fields to update")
        result = supabase.table("nutrition_database").update(data).eq("stt", stt).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Dish STT {stt} not found")
        return {"success": True, "data": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/nutrition-database/{stt}")
async def delete_nutrition_item(stt: int, supabase = Depends(get_supabase)):
    """Delete a dish by STT."""
    try:
        # Unlink from food_scan_logs (foreign key constraint without CASCADE in migration 015)
        supabase.table("food_scan_logs").update({"recognized_dish_stt": None}).eq("recognized_dish_stt", stt).execute()
        
        # Delete from database (other tables like nutrition_log_items and meal_plan_items have ON DELETE CASCADE)
        supabase.table("nutrition_database").delete().eq("stt", stt).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ─── Dish Type Management ────────────────────────────────────────────────

VALID_DISH_TYPES = ["món mặn", "món rau", "món tinh bột", "món canh", "tráng miệng"]


class DishTypeBulkUpdate(BaseModel):
    """Update dish_type for a list of STTs."""
    stts: List[int]
    dish_type: Literal["món mặn", "món rau", "món tinh bột", "món canh", "tráng miệng"]


class DishTypeGroupMapping(BaseModel):
    """Map group_name patterns to dish_type."""
    group_pattern: str   # Substring match against group_name_vi (e.g., "Cơm, cháo, xôi")
    dish_type: Literal["món mặn", "món rau", "món tinh bột", "món canh", "tráng miệng"]


class DishTypeBulkMappings(BaseModel):
    """Bulk mappings from group_name patterns to dish_type."""
    mappings: List[DishTypeGroupMapping]


@router.get("/nutrition-database/dish-types/summary")
async def get_dish_type_summary(supabase = Depends(get_supabase)):
    """Get dish_type distribution summary and list of groups per type."""
    try:
        result = supabase.table("nutrition_database").select(
            "stt, dish_type, group_name_vi"
        ).order("stt").execute()

        dishes = result.data or []

        # Count by dish_type
        type_counts = {}
        for d in dishes:
            dt = d.get("dish_type", "không xác định")
            type_counts[dt] = type_counts.get(dt, 0) + 1

        # Group names per dish_type
        type_groups = {}
        for d in dishes:
            dt = d.get("dish_type", "không xác định")
            gn = d.get("group_name_vi", "")
            if dt not in type_groups:
                type_groups[dt] = set()
            if gn:
                type_groups[dt].add(gn)

        # Convert sets to sorted lists
        type_groups = {k: sorted(list(v)) for k, v in type_groups.items()}

        # Also return unique group_name_vi list for frontend mapping UI
        all_groups = sorted(set(d.get("group_name_vi", "") for d in dishes if d.get("group_name_vi")))

        return {
            "total_dishes": len(dishes),
            "distribution": type_counts,
            "groups_per_type": type_groups,
            "all_groups": all_groups,
            "valid_types": VALID_DISH_TYPES,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/nutrition-database/dish-types/bulk")
async def bulk_update_dish_type(payload: DishTypeBulkUpdate, supabase = Depends(get_supabase)):
    """
    Update dish_type for multiple dishes by STT list.

    Example:
        PATCH /admin/nutrition-database/dish-types/bulk
        {
            "stts": [1, 5, 12, 45],
            "dish_type": "món rau"
        }
    """
    try:
        if not payload.stts:
            raise HTTPException(status_code=400, detail="stts list cannot be empty")

        # Supabase doesn't support .in_ with .update in one call,
        # so we batch update in groups
        updated = 0
        batch_size = 100
        for i in range(0, len(payload.stts), batch_size):
            batch = payload.stts[i:i + batch_size]
            result = (
                supabase.table("nutrition_database")
                .update({"dish_type": payload.dish_type})
                .in_("stt", batch)
                .execute()
            )
            updated += len(result.data or [])

        return {
            "success": True,
            "updated": updated,
            "dish_type": payload.dish_type,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/nutrition-database/dish-types/by-group")
async def bulk_update_dish_type_by_group(
    payload: DishTypeBulkMappings,
    supabase = Depends(get_supabase)
):
    """
    Bulk update dish_type based on group_name_vi pattern matching.
    Each mapping specifies a group_name substring and the target dish_type.

    Example:
        PATCH /admin/nutrition-database/dish-types/by-group
        {
            "mappings": [
                {"group_pattern": "Cơm, cháo, xôi", "dish_type": "món tinh bột"},
                {"group_pattern": "Các loại rau", "dish_type": "món rau"},
                {"group_pattern": "Canh", "dish_type": "món canh"},
                {"group_pattern": "Các loại trái cây", "dish_type": "tráng miệng"},
                {"group_pattern": "Chè", "dish_type": "tráng miệng"}
            ]
        }
    """
    try:
        if not payload.mappings:
            raise HTTPException(status_code=400, detail="mappings list cannot be empty")

        # Fetch all dishes to apply pattern matching in Python
        all_result = supabase.table("nutrition_database").select(
            "stt, group_name_vi, dish_type"
        ).execute()
        all_dishes = all_result.data or []

        results = []
        total_updated = 0

        for mapping in payload.mappings:
            # Find matching STTs
            matching_stts = [
                d["stt"] for d in all_dishes
                if d.get("group_name_vi") and mapping.group_pattern in d["group_name_vi"]
            ]

            if matching_stts:
                # Batch update
                batch_size = 100
                updated = 0
                for i in range(0, len(matching_stts), batch_size):
                    batch = matching_stts[i:i + batch_size]
                    result = (
                        supabase.table("nutrition_database")
                        .update({"dish_type": mapping.dish_type})
                        .in_("stt", batch)
                        .execute()
                    )
                    updated += len(result.data or [])

                total_updated += updated
                results.append({
                    "group_pattern": mapping.group_pattern,
                    "dish_type": mapping.dish_type,
                    "matched": len(matching_stts),
                    "updated": updated,
                })
            else:
                results.append({
                    "group_pattern": mapping.group_pattern,
                    "dish_type": mapping.dish_type,
                    "matched": 0,
                    "updated": 0,
                })

        return {
            "success": True,
            "total_updated": total_updated,
            "details": results,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ─── Nutrition Profiles CRUD ─────────────────────────────────────────────

@router.get("/nutrition-profiles")
async def get_nutrition_profiles(
    limit: int = 50,
    offset: int = 0,
    condition: Optional[str] = None,
    supabase = Depends(get_supabase)
):
    """List nutrition profiles with optional filter by physiological condition."""
    try:
        query = supabase.table("nutrition_profiles").select("*", count="exact")
        if condition:
            query = query.ilike("physiological_condition", f"%{condition}%")
        result = query.order("stt").range(offset, offset + limit - 1).execute()
        return {
            "profiles": result.data or [],
            "total": result.count or 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/nutrition-profiles")
async def add_nutrition_profile(profile: ProfileCreate, supabase = Depends(get_supabase)):
    """Add or update a nutrition profile."""
    try:
        result = supabase.table("nutrition_profiles").upsert(
            profile.model_dump(), on_conflict="stt"
        ).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/nutrition-profiles/{stt}")
async def update_nutrition_profile(stt: int, profile: ProfileCreate, supabase = Depends(get_supabase)):
    """Update a nutrition profile."""
    try:
        result = supabase.table("nutrition_profiles").update(
            profile.model_dump(exclude_unset=True)
        ).eq("stt", stt).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/nutrition-profiles/{stt}")
async def delete_nutrition_profile(stt: int, supabase = Depends(get_supabase)):
    """Delete a nutrition profile and its recommendations."""
    try:
        # 1. Unlink from meal_plans (foreign key constraint without CASCADE)
        # Setting to None/Null instead of deleting the whole meal plan
        supabase.table("meal_plans").update({"profile_stt": None}).eq("profile_stt", stt).execute()
        print(f"[DELETE] Unlinked meal plans for profile {stt}")

        # 2. Delete recommendations first (though DB has ON DELETE CASCADE, we do it explicitly)
        rec_result = supabase.table("nutrition_recommendations").delete().eq("profile_stt", stt).execute()
        print(f"[DELETE] Deleted recommendations for profile {stt}: {rec_result}")
        
        # 3. Then delete the profile
        profile_result = supabase.table("nutrition_profiles").delete().eq("stt", stt).execute()
        print(f"[DELETE] Deleted profile {stt}: {profile_result}")
        
        return {"success": True}
    except Exception as e:
        import traceback
        error_msg = f"Database error: {str(e)}\n{traceback.format_exc()}"
        print(f"[DELETE ERROR] {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)


# ─── Nutrition Recommendations CRUD ──────────────────────────────────────

@router.get("/nutrition-recommendations/{profile_stt}")
async def get_recommendations(profile_stt: int, supabase = Depends(get_supabase)):
    """Get all recommendations for a profile."""
    result = supabase.table("nutrition_recommendations").select("*").eq("profile_stt", profile_stt).execute()
    return {"recommendations": result.data or []}


@router.post("/nutrition-recommendations")
async def add_recommendation(rec: RecommendationCreate, supabase = Depends(get_supabase)):
    """Add a recommendation entry."""
    try:
        result = supabase.table("nutrition_recommendations").insert(rec.model_dump()).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/nutrition-recommendations/{rec_id}")
async def delete_recommendation(rec_id: str, supabase = Depends(get_supabase)):
    """Delete a recommendation entry."""
    try:
        supabase.table("nutrition_recommendations").delete().eq("id", rec_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

