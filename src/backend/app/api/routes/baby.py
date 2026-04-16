from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class BabyCreate(BaseModel):
    name: str
    date_of_birth: str
    gender: Optional[str] = None
    weight_at_birth: Optional[float] = None
    height_at_birth: Optional[float] = None
    blood_type: Optional[str] = None
    notes: Optional[str] = None

class BabyUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    weight_at_birth: Optional[float] = None
    height_at_birth: Optional[float] = None
    blood_type: Optional[str] = None
    notes: Optional[str] = None

class DailyEntryCreate(BaseModel):
    entry_date: str
    milk_score: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    notes: Optional[str] = None

@router.get("/")
async def get_babies(user_id: str, supabase = Depends(get_supabase)):
    """Get all babies for a user's partnership"""
    # Get partnership
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        return {"babies": []}
    
    partnership_id = partnership_result.data[0]["id"]
    
    # Get babies
    result = supabase.table("babies").select("*").eq("partnership_id", partnership_id).execute()
    return {"babies": result.data or []}

@router.post("/")
async def create_baby(user_id: str, baby: BabyCreate, supabase = Depends(get_supabase)):
    """Create a new baby record"""
    # Get partnership
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        raise HTTPException(status_code=404, detail="No active partnership found")
    
    partnership_id = partnership_result.data[0]["id"]
    
    result = supabase.table("babies").insert({
        "partnership_id": partnership_id,
        "name": baby.name,
        "date_of_birth": baby.date_of_birth,
        "gender": baby.gender,
        "weight_at_birth": baby.weight_at_birth,
        "height_at_birth": baby.height_at_birth,
        "blood_type": baby.blood_type,
        "notes": baby.notes,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create baby record")
    
    return {"status": "created", "data": result.data[0]}

@router.get("/{baby_id}")
async def get_baby(baby_id: str, supabase = Depends(get_supabase)):
    """Get baby details"""
    result = supabase.table("babies").select("*").eq("id", baby_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Baby not found")
    
    return {"baby": result.data[0]}

@router.put("/{baby_id}")
async def update_baby(baby_id: str, baby: BabyUpdate, supabase = Depends(get_supabase)):
    """Update baby information"""
    update_data = {}
    
    if baby.name is not None:
        update_data["name"] = baby.name
    if baby.gender is not None:
        update_data["gender"] = baby.gender
    if baby.weight_at_birth is not None:
        update_data["weight_at_birth"] = baby.weight_at_birth
    if baby.height_at_birth is not None:
        update_data["height_at_birth"] = baby.height_at_birth
    if baby.blood_type is not None:
        update_data["blood_type"] = baby.blood_type
    if baby.notes is not None:
        update_data["notes"] = baby.notes
    
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    if not update_data or len(update_data) == 1:  # Only updated_at
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = supabase.table("babies").update(update_data).eq("id", baby_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Baby not found")
    
    return {"status": "updated", "data": result.data[0]}

@router.delete("/{baby_id}")
async def delete_baby(baby_id: str, supabase = Depends(get_supabase)):
    """Delete a baby record"""
    result = supabase.table("babies").delete().eq("id", baby_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Baby not found")
    
    return {"status": "deleted"}

@router.get("/{baby_id}/entries")
async def get_daily_entries(baby_id: str, limit: int = 30, supabase = Depends(get_supabase)):
    """Get daily entries for a baby"""
    result = supabase.table("daily_entries").select("*").eq("baby_id", baby_id).order("entry_date", desc=True).limit(limit).execute()
    return {"entries": result.data or []}

@router.post("/{baby_id}/entries")
async def create_daily_entry(baby_id: str, user_id: str, entry: DailyEntryCreate, supabase = Depends(get_supabase)):
    """Create a daily entry for a baby"""
    result = supabase.table("daily_entries").insert({
        "baby_id": baby_id,
        "recorded_by": user_id,
        "entry_date": entry.entry_date,
        "milk_score": entry.milk_score,
        "weight": entry.weight,
        "height": entry.height,
        "notes": entry.notes
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create daily entry")
    
    return {"status": "created", "data": result.data[0]}

@router.get("/{baby_id}/milestones")
async def get_milestones(baby_id: str, supabase = Depends(get_supabase)):
    """Get milestones for a baby"""
    result = supabase.table("baby_milestones").select("*").eq("baby_id", baby_id).order("age_weeks").execute()
    return {"milestones": result.data or []}

@router.post("/{baby_id}/milestones/{milestone_id}/achieve")
async def achieve_milestone(baby_id: str, milestone_id: str, supabase = Depends(get_supabase)):
    """Mark a milestone as achieved"""
    result = supabase.table("baby_milestones").update({
        "achieved_at": datetime.utcnow().isoformat()
    }).eq("id", milestone_id).eq("baby_id", baby_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    return {"status": "updated", "data": result.data[0]}
