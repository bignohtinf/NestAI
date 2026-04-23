from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional
from datetime import date

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
    """Get today's daily stats"""
    from datetime import date
    
    today = date.today().isoformat()
    
    try:
        result = supabase.table("daily_entries").select("*").eq("recorded_by", user_id).eq("entry_date", today).limit(1).execute()
        
        if result.data:
            entry = result.data[0]
            return {
                "milk_score": entry.get("milk_score", 0),
                "weight": entry.get("weight", 0),
                "height": entry.get("height", 0),
                "notes": entry.get("notes", ""),
            }
        
        return {
            "milk_score": 0,
            "weight": 0,
            "height": 0,
            "notes": "",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

