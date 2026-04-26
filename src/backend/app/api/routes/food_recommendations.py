from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from app.services.food_recommendation_service import get_full_day_recommendations, list_profiles
from app.core.supabase_client import get_supabase
from pydantic import BaseModel, Field
from datetime import date, datetime, timedelta

router = APIRouter()


# ─── Models ──────────────────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    profile_stt: int
    locked_meals: Optional[Dict[str, List[int]]] = None
    excluded: Optional[List[int]] = None
    daily_budget_vnd: Optional[float] = Field(
        default=None,
        description="Ngân sách cả ngày (VNĐ). Tự chia theo tỷ lệ bữa ăn 25/40/35. "
                    "VD: 120000 → sáng 30k, trưa 48k, tối 42k."
    )
    meal_budgets_vnd: Optional[Dict[str, float]] = Field(
        default=None,
        description="Ngân sách riêng cho từng bữa (VNĐ). Override daily_budget nếu set. "
                    "VD: {'breakfast': 30000, 'lunch': 50000, 'dinner': 45000}"
    )


class SaveMealPlanRequest(BaseModel):
    user_id: str
    plan_date: str  # ISO date: "2026-04-28"
    plan_data: Dict[str, Any]  # { breakfast: {...}, lunch: {...}, dinner: {...} }
    nutrition_summary: Optional[Dict[str, Any]] = None
    estimated_cost: Optional[Dict[str, Any]] = None
    target: str = "mother"  # "mother" | "baby"
    profile_stt: int
    daily_budget_vnd: Optional[float] = None


# ─── Recommendation Endpoints ────────────────────────────────────────────

@router.get("/profiles")
async def get_all_profiles():
    """Get all available nutritional profiles (age group, gender, etc.)"""
    profiles = list_profiles()
    if isinstance(profiles, dict) and "error" in profiles:
        raise HTTPException(status_code=500, detail=profiles["error"])
    return {"profiles": profiles}


@router.post("/recommend")
async def get_full_day_meal_recommendations(
    request: RecommendRequest
):
    """
    Get full day meal recommendations for a specific profile.
    
    - profile_stt: The STT of the nutritional profile
    - locked_meals: Dict like {'breakfast': [stt1, stt2]} for pre-selected meals
    - excluded: Optional list of dish STTs to exclude
    - daily_budget_vnd: Total daily budget in VNĐ (auto-split by meal ratio)
    - meal_budgets_vnd: Per-meal budgets in VNĐ (overrides daily_budget)
    
    Response includes `estimated_cost` per plan with per-meal and total costs.
    """
    results = get_full_day_recommendations(
        user_profile_stt=request.profile_stt, 
        locked_meals=request.locked_meals, 
        excluded_dishes=request.excluded,
        daily_budget=request.daily_budget_vnd,
        meal_budgets=request.meal_budgets_vnd,
    )
    
    if isinstance(results, dict) and "error" in results:
        status_code = 404 if "not found" in results["error"] else 500
        raise HTTPException(status_code=status_code, detail=results["error"])
        
    return {"plans": results}


# ─── Meal Plans CRUD ─────────────────────────────────────────────────────

@router.post("/meal-plans")
async def save_meal_plan(request: SaveMealPlanRequest):
    """
    Save a meal plan for a specific date.
    Upserts by (user_id, plan_date, target).
    Also sends notification to partner via partnerships table.
    """
    supabase = get_supabase()

    try:
        # Check if plan already exists for this date/target
        existing = (
            supabase.table("meal_plans")
            .select("id")
            .eq("user_id", request.user_id)
            .eq("plan_date", request.plan_date)
            .execute()
        )

        plan_row = {
            "user_id": request.user_id,
            "plan_date": request.plan_date,
            "plan_data": request.plan_data,
            "nutrition_summary": request.nutrition_summary,
            "estimated_cost": request.estimated_cost,
            "target": request.target,
            "profile_stt": request.profile_stt,
            "daily_budget_vnd": request.daily_budget_vnd,
        }

        if existing.data and len(existing.data) > 0:
            # Update existing
            plan_id = existing.data[0]["id"]
            supabase.table("meal_plans").update(plan_row).eq("id", plan_id).execute()
        else:
            # Insert new
            result = supabase.table("meal_plans").insert(plan_row).execute()
            plan_id = result.data[0]["id"] if result.data else None

        # Send notification to partner
        _notify_partner(supabase, request)

        return {"success": True, "plan_id": plan_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save meal plan: {str(e)}")


@router.get("/meal-plans/week")
async def get_weekly_meal_plans(
    user_id: str,
    week_start: str,  # ISO date: "2026-04-27" (Monday)
):
    """
    Get meal plans for a full week (7 days starting from week_start).
    Returns plans for both mother and baby targets.
    """
    supabase = get_supabase()

    try:
        start = date.fromisoformat(week_start)
        end = start + timedelta(days=6)

        result = (
            supabase.table("meal_plans")
            .select("*")
            .eq("user_id", user_id)
            .gte("plan_date", start.isoformat())
            .lte("plan_date", end.isoformat())
            .order("plan_date")
            .execute()
        )

        # Build day-by-day map
        week_data = {}
        for i in range(7):
            day = (start + timedelta(days=i)).isoformat()
            week_data[day] = None

        for plan in (result.data or []):
            week_data[plan["plan_date"]] = plan

        return {"week_start": week_start, "plans": week_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get weekly plans: {str(e)}")


@router.delete("/meal-plans/{plan_id}")
async def delete_meal_plan(plan_id: str):
    """Delete a meal plan by ID."""
    supabase = get_supabase()

    try:
        supabase.table("meal_plans").delete().eq("id", plan_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete meal plan: {str(e)}")


# ─── Notifications ───────────────────────────────────────────────────────

@router.get("/notifications")
async def get_notifications(
    user_id: str,
    unread_only: bool = False,
    limit: int = 20,
):
    """Get notifications for a user."""
    supabase = get_supabase()

    try:
        query = (
            supabase.table("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
        )

        if unread_only:
            query = query.eq("is_read", False)

        result = query.execute()

        # Count unread
        unread_result = (
            supabase.table("notifications")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .eq("is_read", False)
            .execute()
        )

        return {
            "notifications": result.data or [],
            "unread_count": unread_result.count or 0,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get notifications: {str(e)}")


@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read."""
    supabase = get_supabase()

    try:
        supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark notification: {str(e)}")


@router.patch("/notifications/read-all")
async def mark_all_notifications_read(user_id: str):
    """Mark all notifications as read for a user."""
    supabase = get_supabase()

    try:
        supabase.table("notifications").update({"is_read": True}).eq("user_id", user_id).eq("is_read", False).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark all notifications: {str(e)}")


# ─── Helpers ─────────────────────────────────────────────────────────────

def _notify_partner(supabase, request: SaveMealPlanRequest):
    """Send notification to partner (father) when meal plan is saved."""
    try:
        # Find partner via partnerships
        partnerships = (
            supabase.table("partnerships")
            .select("requested_by, requested_to")
            .eq("status", "accepted")
            .or_(
                f"requested_by.eq.{request.user_id},"
                f"requested_to.eq.{request.user_id}"
            )
            .execute()
        )

        if not partnerships.data:
            return  # No partner linked

        # Determine partner user_id
        p = partnerships.data[0]
        partner_id = (
            p["requested_to"]
            if p["requested_by"] == request.user_id
            else p["requested_by"]
        )

        # Get user name for notification
        user_result = supabase.table("users").select("full_name").eq("id", request.user_id).execute()
        user_name = "Mẹ"
        if user_result.data:
            user_name = user_result.data[0].get("full_name", "Mẹ")

        # Format date
        plan_date = request.plan_date
        try:
            d = date.fromisoformat(plan_date)
            formatted_date = d.strftime("%d/%m")
        except ValueError:
            formatted_date = plan_date

        # Build notification message
        target_label = "mẹ" if request.target == "mother" else "bé"
        total_kcal = ""
        if request.nutrition_summary and "total" in request.nutrition_summary:
            kcal = request.nutrition_summary["total"].get("energy", 0)
            total_kcal = f" — {int(kcal)} kcal"

        cost_info = ""
        if request.estimated_cost and "total" in request.estimated_cost:
            total_cost = request.estimated_cost["total"]
            if total_cost:
                cost_info = f", {int(total_cost):,}đ".replace(",", ".")

        notification = {
            "user_id": partner_id,
            "type": "meal_plan_created",
            "title": f"🍽️ Thực đơn mới cho {target_label}",
            "message": f"{user_name} đã tạo thực đơn ngày {formatted_date}{total_kcal}{cost_info}",
            "data": {
                "plan_date": request.plan_date,
                "target": request.target,
                "created_by": request.user_id,
            },
        }

        supabase.table("notifications").insert(notification).execute()

    except Exception as e:
        # Notification failure should not block meal plan save
        print(f"Warning: Failed to send notification to partner: {e}")
