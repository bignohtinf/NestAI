from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class MilkScoreCreate(BaseModel):
    score: float
    notes: Optional[str] = None

@router.get("/milk-score")
async def get_milk_scores(user_id: str, limit: int = 30, supabase = Depends(get_supabase)):
    """Get milk scores for a mother"""
    result = supabase.table("milk_scores").select("*").eq("mother_id", user_id).order("date", desc=True).limit(limit).execute()
    return {"scores": result.data or []}

@router.post("/milk-score")
async def create_milk_score(user_id: str, score_data: MilkScoreCreate, supabase = Depends(get_supabase)):
    """Create a milk score entry"""
    result = supabase.table("milk_scores").insert({
        "mother_id": user_id,
        "score": score_data.score,
        "notes": score_data.notes
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create milk score")
    
    return {"status": "created", "data": result.data[0]}

@router.get("/current-score")
async def get_current_milk_score(user_id: str, supabase = Depends(get_supabase)):
    """Get the latest milk score"""
    result = supabase.table("milk_scores").select("*").eq("mother_id", user_id).order("date", desc=True).limit(1).execute()
    
    if not result.data:
        return {"score": 0, "date": None}
    
    return {"score": result.data[0].get("score", 0), "date": result.data[0].get("date")}

@router.get("/trend")
async def get_milk_score_trend(user_id: str, days: int = 30, supabase = Depends(get_supabase)):
    """Get milk score trend for the past N days"""
    result = supabase.table("milk_scores").select("*").eq("mother_id", user_id).order("date", desc=True).limit(days).execute()
    
    scores = result.data or []
    avg_score = sum(s.get("score", 0) for s in scores) / len(scores) if scores else 0
    
    return {
        "scores": scores,
        "average": avg_score,
        "count": len(scores)
    }

