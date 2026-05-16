import logging

from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from app.services.food_recommendation_service import get_full_day_recommendations, list_profiles
from app.core.supabase_client import get_supabase
from pydantic import BaseModel, Field
from datetime import date, datetime, timedelta

logger = logging.getLogger(__name__)
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
            .eq("target", request.target)
            .execute()
        )

        # Build plan row with only non-null fields
        plan_row = {
            "user_id": request.user_id,
            "plan_date": request.plan_date,
            "plan_data": request.plan_data,
            "target": request.target,
            "profile_stt": request.profile_stt,
        }
        
        # Add optional fields only if they're not None
        if request.nutrition_summary is not None:
            plan_row["nutrition_summary"] = request.nutrition_summary
        if request.estimated_cost is not None:
            plan_row["estimated_cost"] = request.estimated_cost
        if request.daily_budget_vnd is not None:
            plan_row["daily_budget_vnd"] = request.daily_budget_vnd

        if existing.data and len(existing.data) > 0:
            # Update existing
            plan_id = existing.data[0]["id"]
            supabase.table("meal_plans").update(plan_row).eq("id", plan_id).execute()
        else:
            # Insert new
            result = supabase.table("meal_plans").insert(plan_row).execute()
            plan_id = result.data[0]["id"] if result.data else None

        # Write nutrition_logs + nutrition_log_items so getSummary() can aggregate
        # vi chất (iron, calcium, vitamin_c, zinc) from the actual dishes selected.
        _save_nutrition_log_for_plan(supabase, request)

        # Send notification to partner
        _notify_partner(supabase, request)

        return {"success": True, "plan_id": plan_id}

    except Exception as e:
        logger.error(f"Failed to save meal plan: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


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

def _save_nutrition_log_for_plan(supabase, request: SaveMealPlanRequest) -> None:
    """
    Upsert a nutrition_logs entry + nutrition_log_items for the saved meal plan so
    that /api/nutrition/summary can aggregate daily macro + vi chất (iron, calcium,
    vitamin_c, zinc) from the real dish data in nutrition_database.

    Called every time a meal plan is saved or updated — safe to run multiple times
    for the same (user_id, plan_date) because it deletes stale items first.
    """
    from app.api.routes.nutrition import invalidate_nutrition_cache

    try:
        ns = request.nutrition_summary or {}
        total = ns.get("total") or {}

        # ── 1. Upsert nutrition_logs ─────────────────────────────────────
        log_row = {
            "user_id": request.user_id,
            "log_date": request.plan_date,
            "calories": round(float(total.get("energy") or 0)),
            "protein": float(total.get("protein")) if total.get("protein") is not None else None,
            "carbs":   float(total.get("carbohydrate")) if total.get("carbohydrate") is not None else None,
            "fat":     float(total.get("fat")) if total.get("fat") is not None else None,
            "notes":   f"Thực đơn AI {request.plan_date}",
            "source":  "ai_recommendation",
        }

        existing_log = (
            supabase.table("nutrition_logs")
            .select("id")
            .eq("user_id", request.user_id)
            .eq("log_date", request.plan_date)
            .eq("source", "ai_recommendation")
            .execute()
        )

        if existing_log.data:
            log_id = existing_log.data[0]["id"]
            supabase.table("nutrition_logs").update(log_row).eq("id", log_id).execute()
            # Remove stale items so we don't double-count on re-generate
            supabase.table("nutrition_log_items").delete().eq("log_id", log_id).execute()
        else:
            ins = supabase.table("nutrition_logs").insert(log_row).execute()
            log_id = ins.data[0]["id"] if ins.data else None

        if not log_id:
            logger.warning("_save_nutrition_log_for_plan: no log_id, skipping items")
            return

        # ── 2. Insert nutrition_log_items for each dish STT ──────────────
        # plan_data shape: { breakfast: { dishes: [...], stts: [int, ...] }, ... }
        items: list[dict] = []
        for meal_key in ("breakfast", "lunch", "dinner"):
            meal = request.plan_data.get(meal_key) or {}
            stts: list[int] = meal.get("stts") or []
            for stt in stts:
                if isinstance(stt, int):
                    items.append({"log_id": log_id, "dish_stt": stt, "servings": 1.0})

        if items:
            supabase.table("nutrition_log_items").insert(items).execute()

        # ── 3. Invalidate in-memory summary cache ────────────────────────
        invalidate_nutrition_cache(request.user_id)

    except Exception as exc:
        # Non-fatal — meal plan is already saved; don't surface this to the user.
        logger.warning(f"_save_nutrition_log_for_plan failed (non-fatal): {exc}")


def _notify_partner(supabase, request: SaveMealPlanRequest):
    """Send notification to partner (father) when meal plan is saved."""
    try:
        # Find accepted partnership for this user
        try:
            partnerships = (
                supabase.table("partnerships")
                .select("father_id, mother_id, status")
                .execute()
            )
        except Exception as e:
            logger.warning(f"_notify_partner: failed to query partnerships: {e}")
            return

        # Resolve partner_id from the accepted partnership
        partner_id = None
        for p in (partnerships.data or []):
            if p.get("status") != "accepted":
                continue
            if p.get("mother_id") == request.user_id:
                partner_id = p.get("father_id")
                break
            elif p.get("father_id") == request.user_id:
                partner_id = p.get("mother_id")
                break

        if not partner_id:
            return

        # Get user name for notification
        try:
            user_result = supabase.table("users").select("full_name").eq("id", request.user_id).execute()
            user_name = "Mẹ"
            if user_result.data:
                user_name = user_result.data[0].get("full_name", "Mẹ")
        except Exception as e:
            logger.warning(f"_notify_partner: failed to get user name: {e}")
            user_name = "Mẹ"

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

        # Build meals summary for notification dialog
        meals_summary = []
        for meal_key, meal_label in [("breakfast", "Bữa sáng"), ("lunch", "Bữa trưa"), ("dinner", "Bữa tối")]:
            meal = request.plan_data.get(meal_key) or {}
            dishes_raw = meal.get("dishes") or []
            dishes_formatted = []
            for d in dishes_raw:
                dishes_formatted.append({
                    "name": d.get("dish_name_vi") or d.get("name") or "—",
                    "dish_type": d.get("dish_type") or "",
                    "grams": d.get("grams") or 100,
                    "energy": d.get("energy") or 0,
                    "protein": d.get("protein") or 0,
                    "fat": d.get("fat") or 0,
                    "carbohydrate": d.get("carbohydrate") or 0,
                })
            meal_nutrition = (request.nutrition_summary or {}).get(meal_key)
            meals_summary.append({
                "key": meal_key,
                "label": meal_label,
                "dishes": dishes_formatted,
                "nutrition": meal_nutrition,
            })

        notification = {
            "user_id": partner_id,
            "type": "meal_plan_created",
            "title": f"🍽️ Thực đơn mới cho {target_label}",
            "message": f"{user_name} đã tạo thực đơn ngày {formatted_date}{total_kcal}{cost_info}",
            "data": {
                "plan_date": request.plan_date,
                "target": request.target,
                "created_by": request.user_id,
                "meals": meals_summary,
                "total_nutrition": ns_total if (ns_total := (request.nutrition_summary or {}).get("total")) else None,
                "estimated_cost": (request.estimated_cost or {}).get("total"),
            },
        }

        supabase.table("notifications").insert(notification).execute()

    except Exception as e:
        logger.error(f"_notify_partner failed: {e}", exc_info=True)
