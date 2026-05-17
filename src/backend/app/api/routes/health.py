from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.supabase_client import get_supabase

router = APIRouter()

class MilkScoreCreate(BaseModel):
    score: float
    notes: Optional[str] = None

@router.get("/milk-score")
async def get_milk_scores(user_id: str, limit: int = 30, supabase = Depends(get_supabase)):
    """Get milk scores for a mother from daily_entries"""
    try:
        result = supabase.table("daily_entries").select("*").eq("recorded_by", user_id).not_.is_("milk_score", "null").order("entry_date", desc=True).limit(limit).execute()
        return {"scores": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/milk-score")
async def create_milk_score(user_id: str, score_data: MilkScoreCreate, supabase = Depends(get_supabase)):
    """Create a milk score entry in daily_entries"""
    try:
        # Get user's baby first
        partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
        
        if not partnership_result.data:
            raise HTTPException(status_code=404, detail="No active partnership found")
        
        partnership_id = partnership_result.data[0]["id"]
        
        # Get baby
        baby_result = supabase.table("babies").select("id").eq("partnership_id", partnership_id).limit(1).execute()
        
        if not baby_result.data:
            raise HTTPException(status_code=404, detail="No baby found")
        
        baby_id = baby_result.data[0]["id"]
        
        result = supabase.table("daily_entries").insert({
            "baby_id": baby_id,
            "recorded_by": user_id,
            "entry_date": date.today().isoformat(),
            "milk_score": int(score_data.score),
            "notes": score_data.notes
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create milk score")
        
        return {"status": "created", "data": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/current-score")
async def get_current_milk_score(user_id: str, supabase = Depends(get_supabase)):
    """Get the latest milk score"""
    try:
        result = supabase.table("daily_entries").select("*").eq("recorded_by", user_id).not_.is_("milk_score", "null").order("entry_date", desc=True).limit(1).execute()
        
        if not result.data:
            return {"score": 0, "date": None}
        
        return {"score": result.data[0].get("milk_score", 0), "date": result.data[0].get("entry_date")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/trend")
async def get_milk_score_trend(user_id: str, days: int = 30, supabase = Depends(get_supabase)):
    """Get milk score trend for the past N days"""
    try:
        result = supabase.table("daily_entries").select("*").eq("recorded_by", user_id).not_.is_("milk_score", "null").order("entry_date", desc=True).limit(days).execute()
        
        scores = result.data or []
        avg_score = sum(s.get("milk_score", 0) for s in scores) / len(scores) if scores else 0
        
        return {
            "scores": scores,
            "average": avg_score,
            "count": len(scores)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/daily-stats")
async def get_daily_stats(user_id: str, supabase = Depends(get_supabase)):
    """Get today's daily stats for dad's dashboard.
    Returns mom's wellness data (via partnership) + latest milk score.
    """
    from datetime import date

    today = date.today().isoformat()

    default = {
        "milk_score": 0,
        "sleep_hours": 0,
        "hydration_level": 0,
        "activity_level": 0,
        "stress_level": 0,
        "mood": "neutral",
    }

    try:
        # Latest milk score recorded by this user
        milk_result = (
            supabase.table("daily_entries")
            .select("milk_score")
            .eq("recorded_by", user_id)
            .not_.is_("milk_score", "null")
            .order("entry_date", desc=True)
            .limit(1)
            .execute()
        )
        if milk_result.data:
            default["milk_score"] = milk_result.data[0].get("milk_score", 0)

        # Find accepted partnership to get mother_id
        partnership_result = (
            supabase.table("partnerships")
            .select("mother_id, father_id")
            .or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}")
            .eq("status", "accepted")
            .limit(1)
            .execute()
        )
        if not partnership_result.data:
            return default

        mother_id = partnership_result.data[0].get("mother_id")
        if not mother_id:
            return default

        # Query mom's wellness entry for today
        wellness_result = (
            supabase.table("wellness_entries")
            .select("sleep_hours, water_intake_ml, energy_level, mood")
            .eq("user_id", mother_id)
            .eq("entry_date", today)
            .limit(1)
            .execute()
        )
        if not wellness_result.data:
            return default

        entry = wellness_result.data[0]

        # water_intake_ml → hydration % (3000 ml = 100%)
        water_ml = entry.get("water_intake_ml") or 0
        hydration_level = min(100, round(water_ml / 3000 * 100))

        # energy_level (1–5) → activity % (0–100)
        energy = entry.get("energy_level") or 3
        activity_level = round((energy - 1) / 4 * 100)

        # mood integer (1–5) → string label
        mood_int = entry.get("mood") or 3
        mood = "happy" if mood_int >= 4 else "sad" if mood_int <= 2 else "neutral"

        return {
            "milk_score": default["milk_score"],
            "sleep_hours": entry.get("sleep_hours") or 0,
            "hydration_level": hydration_level,
            "activity_level": activity_level,
            "stress_level": 0,  # no stress column in wellness_entries
            "mood": mood,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

