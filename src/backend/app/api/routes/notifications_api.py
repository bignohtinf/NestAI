import logging
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.routes.nutrition import invalidate_nutrition_cache
from app.core.supabase_client import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class MealPlanNotificationRequest(BaseModel):
    mother_id: str
    plan_date: str
    plan_data: Dict[str, Any]
    target: str

class ScanFoodNotificationRequest(BaseModel):
    mother_id: str
    meal_data: Dict[str, Any]

@router.post("/meal-plan")
async def create_meal_plan_notification(request: MealPlanNotificationRequest, supabase = Depends(get_supabase)):
    """Manual trigger for meal plan notification (used by frontend if needed)"""
    try:
        # Find partner
        partnerships = supabase.table("partnerships").select("father_id").eq("mother_id", request.mother_id).eq("status", "accepted").execute()
        if not partnerships.data:
            return {"success": True, "skipped": True, "message": "No partner to notify"}
        
        partner_id = partnerships.data[0]["father_id"]
        
        # Get mother name
        user_res = supabase.table("users").select("full_name").eq("id", request.mother_id).execute()
        mother_name = user_res.data[0]["full_name"] if user_res.data else "Mẹ"
        
        target_label = "mẹ" if request.target == "mother" else "bé"
        
        notification = {
            "user_id": partner_id,
            "type": "meal_plan_created",
            "title": f"🍽️ Thực đơn mới cho {target_label}",
            "message": f"{mother_name} đã cập nhật thực đơn ngày {request.plan_date}",
            "data": {
                "plan_date": request.plan_date,
                "target": request.target,
                "created_by": request.mother_id,
                "meals": [
                    {
                        "key": k,
                        "label": "Bữa sáng" if k == "breakfast" else "Bữa trưa" if k == "lunch" else "Bữa tối",
                        "dishes": v.get("dishes", []),
                        "nutrition": v.get("nutrition", {})
                    }
                    for k, v in request.plan_data.items()
                ]
            }
        }
        
        supabase.table("notifications").insert(notification).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"create_meal_plan_notification failed: {e}", exc_info=True)
        return {"success": False, "error": str(e)}

VALID_LOG_SOURCES = {"manual", "ai_recommendation", "smart_scan"}

@router.post("/scan-food")
async def create_scan_food_notification(request: ScanFoodNotificationRequest, supabase = Depends(get_supabase)):
    """Create notification when mother scans a meal + save to nutrition_logs"""
    try:
        meal_data = request.meal_data
        meal_name = meal_data.get("meal_name", "bữa ăn")

        # 1. Lưu nhật ký dinh dưỡng cho mẹ (luôn chạy dù có partner hay không)
        raw_source = meal_data.get("source", "smart_scan")
        log_source = raw_source if raw_source in VALID_LOG_SOURCES else "smart_scan"
        meal_data.get("meal_context")

        try:
            from datetime import date as _date
            supabase.table("nutrition_logs").insert({
                "user_id": request.mother_id,
                "log_date": _date.today().isoformat(),   # NOT NULL — bắt buộc phải có
                # "meal_name" không tồn tại trong schema → dùng notes thay thế
                "notes": meal_name,                       # tên món hiển thị trong lịch sử
                "calories": round(float(meal_data.get("total_calories") or 0)),
                "protein": float(meal_data.get("total_protein")) if meal_data.get("total_protein") is not None else None,
                "carbs": float(meal_data.get("total_carbs")) if meal_data.get("total_carbs") is not None else None,
                "fat": float(meal_data.get("total_fat")) if meal_data.get("total_fat") is not None else None,
                "source": log_source,
            }).execute()
            # Invalidate nutrition cache vì có bữa ăn mới
            invalidate_nutrition_cache(request.mother_id)
        except Exception as log_err:
            logger.warning(f"scan-food: failed to save nutrition log: {log_err}")

        # 2. Tìm partner để gửi notification
        partnerships = supabase.table("partnerships").select("father_id").eq("mother_id", request.mother_id).eq("status", "accepted").execute()
        if not partnerships.data:
            return {"success": True, "skipped": True, "message": "No partner to notify"}

        partner_id = partnerships.data[0]["father_id"]

        # 3. Lấy tên mẹ
        user_res = supabase.table("users").select("full_name").eq("id", request.mother_id).execute()
        mother_name = user_res.data[0]["full_name"] if user_res.data else "Mẹ"

        # 4. Insert notification cho bố
        notification = {
            "user_id": partner_id,
            "type": "scan_food",
            "title": f"🍽️ {mother_name} vừa lưu bữa ăn",
            "message": f"{meal_name} — {meal_data.get('total_calories', 0)} kcal | Protein: {meal_data.get('total_protein', 0)}g | Carbs: {meal_data.get('total_carbs', 0)}g | Béo: {meal_data.get('total_fat', 0)}g",
            "data": {
                **meal_data,
                "mother_name": mother_name,
                "scanned_at": datetime.utcnow().isoformat()
            }
        }

        supabase.table("notifications").insert(notification).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"create_scan_food_notification failed: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@router.post("/scan-food/backfill")
async def backfill_nutrition_logs_from_notifications(supabase = Depends(get_supabase)):
    """
    Backfill nutrition_logs từ các scan_food notifications đã có sẵn.
    Dùng 1 lần để khôi phục dữ liệu lịch sử.
    """
    try:
        # Lấy tất cả scan_food notifications
        notifs_res = supabase.table("notifications").select("*").eq("type", "scan_food").execute()
        notifications = notifs_res.data or []

        inserted = 0
        skipped = 0

        for notif in notifications:
            data = notif.get("data") or {}
            mother_id = data.get("mother_id")

            # Xác định mother_id: có thể lưu trong data, hoặc suy từ partnership
            if not mother_id:
                # Tìm ngược từ father_id (user_id của notification)
                father_id = notif.get("user_id")
                part_res = supabase.table("partnerships").select("mother_id").eq("father_id", father_id).eq("status", "accepted").execute()
                if part_res.data:
                    mother_id = part_res.data[0]["mother_id"]

            if not mother_id:
                skipped += 1
                continue

            meal_name = data.get("meal_name", "Bữa ăn")
            calories = float(data.get("total_calories") or 0)
            protein = data.get("total_protein")
            carbs = data.get("total_carbs")
            fat = data.get("total_fat")
            meal_context = data.get("meal_context")
            created_at = notif.get("created_at", datetime.utcnow().isoformat())

            try:
                supabase.table("nutrition_logs").insert({
                    "user_id": mother_id,
                    "meal_name": meal_name,
                    "calories": calories,
                    "protein": float(protein) if protein is not None else None,
                    "carbs": float(carbs) if carbs is not None else None,
                    "fat": float(fat) if fat is not None else None,
                    "notes": f"Bữa {meal_context}" if meal_context else "Quét bữa ăn AI (backfill)",
                    "source": "smart_scan",
                    "created_at": created_at,
                }).execute()
                inserted += 1
            except Exception as e:
                logger.warning(f"backfill: skipped notif {notif.get('id')}: {e}")
                skipped += 1

        return {"success": True, "inserted": inserted, "skipped": skipped}
    except Exception as e:
        logger.error(f"backfill_nutrition_logs failed: {e}", exc_info=True)
        return {"success": False, "error": str(e)}
