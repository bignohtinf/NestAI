from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, timedelta

router = APIRouter()

class MedicalProfileUpdate(BaseModel):
    pregnancy_status: Optional[str] = None
    last_menstrual_period: Optional[date] = None
    due_date: Optional[date] = None
    current_weight_kg: Optional[float] = None
    pre_pregnancy_weight_kg: Optional[float] = None
    height_cm: Optional[float] = None

@router.get("/me")
async def get_my_medical_profile(user_id: str, supabase = Depends(get_supabase)):
    """Get the medical profile for the current user"""
    try:
        result = supabase.table("medical_profiles").select("*").eq("user_id", user_id).execute()
        
        if not result.data:
            # Create a default profile if none exists
            new_profile = {
                "user_id": user_id,
                "pregnancy_status": "not_pregnant"
            }
            insert_result = supabase.table("medical_profiles").insert(new_profile).execute()
            if not insert_result.data:
                raise HTTPException(status_code=500, detail="Failed to create medical profile")
            return {"profile": insert_result.data[0]}
            
        profile = result.data[0]
        
        # Auto-calculate week if pregnant
        if profile.get("pregnancy_status") == "pregnant":
            updated_profile = calculate_pregnancy_info(profile)
            if updated_profile:
                # Optional: sync back to DB if calculated values changed significantly
                profile = updated_profile
                
        return {"profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/me")
async def update_my_medical_profile(user_id: str, data: MedicalProfileUpdate, supabase = Depends(get_supabase)):
    """Update medical profile and auto-calculate pregnancy fields"""
    try:
        update_data = data.model_dump(exclude_unset=True)
        
        # If pregnancy info is updated, recalculate weeks/due_date
        if data.pregnancy_status == "pregnant" or data.last_menstrual_period or data.due_date:
            # Get existing profile for reference
            current_res = supabase.table("medical_profiles").select("*").eq("user_id", user_id).execute()
            current_profile = current_res.data[0] if current_res.data else {}
            
            # Merge current data with updates for calculation
            calc_base = {**current_profile, **update_data}
            calc_results = calculate_pregnancy_info(calc_base)
            
            if calc_results:
                update_data["week_of_pregnancy"] = calc_results["week_of_pregnancy"]
                update_data["due_date"] = calc_results["due_date"]
                update_data["trimester"] = calc_results["trimester"]
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("medical_profiles").upsert({
            "user_id": user_id,
            **update_data
        }, on_conflict="user_id").execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update medical profile")
            
        return {"status": "updated", "profile": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

def calculate_pregnancy_info(profile: dict):
    """Logic to calculate week, trimester and due date"""
    lmp = profile.get("last_menstrual_period")
    due_date = profile.get("due_date")
    
    if isinstance(lmp, str): lmp = date.fromisoformat(lmp)
    if isinstance(due_date, str): due_date = date.fromisoformat(due_date)
    
    today = date.today()
    
    # Priority 1: Calculate from LMP
    if lmp:
        if not due_date:
            due_date = lmp + timedelta(days=280)
        
        days_diff = (today - lmp).days
        weeks = max(0, min(42, days_diff // 7))
        days_in_week = max(0, days_diff % 7)
    # Priority 2: Calculate from Due Date if LMP missing
    elif due_date:
        days_to_due = (due_date - today).days
        total_days = 280 - days_to_due
        weeks = max(0, min(42, total_days // 7))
        days_in_week = max(0, total_days % 7)
    else:
        return None

    # Trimester calculation
    if weeks <= 13:
        trimester = 1
    elif weeks <= 26:
        trimester = 2
    else:
        trimester = 3
        
    return {
        **profile,
        "week_of_pregnancy": weeks,
        "days_in_week": days_in_week,
        "due_date": due_date.isoformat() if due_date else None,
        "trimester": trimester
    }
