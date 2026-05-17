from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.supabase_client import get_supabase

router = APIRouter()

class MissionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target: int = 0
    level: Optional[str] = None

class MissionUpdate(BaseModel):
    progress: Optional[int] = None
    is_completed: Optional[bool] = None

@router.get("/")
async def get_missions(user_id: str, supabase = Depends(get_supabase)):
    """Get all missions for a user"""
    # Get partnership first
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        return {"missions": []}
    
    partnership_id = partnership_result.data[0]["id"]
    
    # Get missions for this partnership
    result = supabase.table("missions").select("*").eq("partnership_id", partnership_id).execute()
    return {"missions": result.data or []}

@router.post("/")
async def create_mission(user_id: str, mission: MissionCreate, supabase = Depends(get_supabase)):
    """Create a new mission"""
    # Get partnership
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        raise HTTPException(status_code=404, detail="No active partnership found")
    
    partnership_id = partnership_result.data[0]["id"]
    
    result = supabase.table("missions").insert({
        "partnership_id": partnership_id,
        "title": mission.title,
        "description": mission.description,
        "target": mission.target,
        "progress": 0,
        "level": mission.level or "bronze",
        "is_completed": False
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create mission")
    
    return {"status": "created", "data": result.data[0]}

@router.put("/{mission_id}")
async def update_mission(mission_id: str, update: MissionUpdate, supabase = Depends(get_supabase)):
    """Update mission progress"""
    update_data = {}
    if update.progress is not None:
        update_data["progress"] = update.progress
    if update.is_completed is not None:
        update_data["is_completed"] = update.is_completed
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = supabase.table("missions").update(update_data).eq("id", mission_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    return {"status": "updated", "data": result.data[0]}

@router.get("/stats")
async def get_mission_stats(user_id: str, supabase = Depends(get_supabase)):
    """Get mission statistics"""
    # Get partnership
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        return {"total": 0, "completed": 0, "in_progress": 0}
    
    partnership_id = partnership_result.data[0]["id"]
    
    # Get all missions
    result = supabase.table("missions").select("*").eq("partnership_id", partnership_id).execute()
    missions = result.data or []
    
    completed = sum(1 for m in missions if m.get("is_completed"))
    in_progress = sum(1 for m in missions if not m.get("is_completed"))
    
    return {
        "total": len(missions),
        "completed": completed,
        "in_progress": in_progress
    }

