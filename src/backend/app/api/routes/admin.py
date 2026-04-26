from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime, timedelta

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
        # Get total users
        users_result = supabase.table("users").select("id, role").execute()
        total_users = len(users_result.data or [])
        
        # Count by role
        users_data = users_result.data or []
        total_admins = len([u for u in users_data if u.get("role") == "admin"])
        total_mothers = len([u for u in users_data if u.get("role") == "mother"])
        total_fathers = len([u for u in users_data if u.get("role") == "father"])
        
        # Get total partnerships
        partnerships_result = supabase.table("partnerships").select("id").eq("status", "accepted").execute()
        total_partnerships = len(partnerships_result.data or [])
        
        # Get total babies
        babies_result = supabase.table("babies").select("id").execute()
        total_babies = len(babies_result.data or [])
        
        # Get active users (logged in last 7 days)
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        active_result = supabase.table("users").select("id").gt("last_login", seven_days_ago).execute()
        active_users = len(active_result.data or [])
        
        return {
            "totalUsers": total_users,
            "totalAdmins": total_admins,
            "totalMothers": total_mothers,
            "totalFathers": total_fathers,
            "activeUsers": active_users,
            "totalPartnerships": total_partnerships,
            "totalBabies": total_babies,
        }
    except Exception as e:
        print(f"Error in get_admin_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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


@router.delete("/nutrition-profiles/{stt}")
async def delete_nutrition_profile(stt: int, supabase = Depends(get_supabase)):
    """Delete a nutrition profile and its recommendations."""
    try:
        supabase.table("nutrition_recommendations").delete().eq("profile_stt", stt).execute()
        supabase.table("nutrition_profiles").delete().eq("stt", stt).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


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

