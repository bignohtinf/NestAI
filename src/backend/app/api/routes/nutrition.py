from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class NutritionLogCreate(BaseModel):
    meal_name: str
    calories: float
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None

@router.get("/logs")
async def get_nutrition_logs(user_id: str, limit: int = 30, supabase = Depends(get_supabase)):
    """Get nutrition logs for a user"""
    result = supabase.table("nutrition_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
    return {"logs": result.data or []}

@router.post("/logs")
async def create_nutrition_log(user_id: str, log: NutritionLogCreate, supabase = Depends(get_supabase)):
    """Create a nutrition log entry"""
    result = supabase.table("nutrition_logs").insert({
        "user_id": user_id,
        "meal_name": log.meal_name,
        "calories": log.calories,
        "protein": log.protein,
        "carbs": log.carbs,
        "fat": log.fat,
        "image_url": log.image_url,
        "notes": log.notes
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create nutrition log")
    
    return {"status": "created", "data": result.data[0]}

@router.get("/summary")
async def get_nutrition_summary(user_id: str, days: int = 7, supabase = Depends(get_supabase)):
    """Get nutrition summary for the past N days"""
    result = supabase.table("nutrition_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(days * 3).execute()
    
    logs = result.data or []
    total_calories = sum(log.get("calories", 0) for log in logs)
    total_protein = sum(log.get("protein", 0) for log in logs if log.get("protein"))
    avg_calories = total_calories / len(logs) if logs else 0
    
    return {
        "total_calories": total_calories,
        "total_protein": total_protein,
        "avg_calories": avg_calories,
        "log_count": len(logs)
    }

