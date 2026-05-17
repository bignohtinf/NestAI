from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.supabase_client import get_supabase

router = APIRouter()

# ==================== Schemas ====================

class WellnessProfileUpdate(BaseModel):
    health_focus: Optional[List[str]] = None
    last_sleep_hours: Optional[float] = None
    current_mood: Optional[int] = None
    health_concerns: Optional[str] = None
    reminder_time: Optional[str] = None
    personalization_completed: Optional[bool] = None

class WellnessEntryCreate(BaseModel):
    entry_date: Optional[date] = None
    milk_score: Optional[int] = None
    mood: Optional[int] = None
    sleep_hours: Optional[float] = None
    water_intake_ml: Optional[int] = None
    energy_level: Optional[int] = None
    notes: Optional[str] = None

class ChallengeComplete(BaseModel):
    challenge_id: str
    completed: bool

# ==================== GET Endpoints ====================

@router.get("/profile/{user_id}")
async def get_wellness_profile(user_id: str, supabase = Depends(get_supabase)):
    """Get or create wellness profile for user"""
    try:
        # Try to get existing profile
        result = supabase.table("wellness_profiles").select("*").eq("user_id", user_id).execute()

        if result.data and len(result.data) > 0:
            return {"profile": result.data[0]}

        # Create new profile if doesn't exist
        new_profile = {
            "user_id": user_id,
            "health_focus": [],
            "current_mood": 3,
            "last_sleep_hours": 0,
            "personalization_completed": False
        }
        insert_result = supabase.table("wellness_profiles").insert(new_profile).execute()

        if insert_result.data:
            return {"profile": insert_result.data[0]}

        raise HTTPException(status_code=500, detail="Failed to create wellness profile")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/entries/{user_id}")
async def get_wellness_entries(user_id: str, days: int = Query(7, ge=1, le=90), supabase = Depends(get_supabase)):
    """Get wellness entries for last N days"""
    try:
        start_date = date.today() - timedelta(days=days)

        result = supabase.table("wellness_entries")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("entry_date", start_date.isoformat())\
            .order("entry_date", desc=True)\
            .execute()

        return {"entries": result.data or [], "count": len(result.data or [])}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/health-score/{user_id}")
async def get_health_score(user_id: str, supabase = Depends(get_supabase)):
    """Calculate current health score (0-100) based on wellness entries"""
    try:
        # Get today's entry
        today = date.today().isoformat()
        result = supabase.table("wellness_entries")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("entry_date", today)\
            .execute()

        if not result.data:
            return {"score": 0, "color": "red", "message": "No data for today"}

        entry = result.data[0]

        # Calculate health score: weighted average
        # milk_score: 30%, mood: 25%, sleep: 25%, energy: 20%
        score_components = {
            "milk_score": (entry.get("milk_score") or 0) * 0.3,  # 0-100
            "mood": ((entry.get("mood") or 3) / 5) * 100 * 0.25,  # 1-5 scale
            "sleep": (min(entry.get("sleep_hours") or 0, 8) / 8) * 100 * 0.25,  # up to 8h
            "energy": ((entry.get("energy_level") or 3) / 5) * 100 * 0.2  # 1-5 scale
        }

        total_score = sum(score_components.values())

        # Determine color based on score
        if total_score >= 81:
            color = "green"
            message = "Excellent!"
        elif total_score >= 61:
            color = "light-green"
            message = "Good!"
        elif total_score >= 31:
            color = "yellow"
            message = "Fair"
        else:
            color = "red"
            message = "Needs attention"

        return {
            "score": round(total_score),
            "color": color,
            "message": message,
            "components": score_components
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/trend/{user_id}")
async def get_wellness_trend(user_id: str, days: int = Query(7, ge=1, le=30), supabase = Depends(get_supabase)):
    """Get trend data for chart visualization"""
    try:
        start_date = date.today() - timedelta(days=days-1)

        result = supabase.table("wellness_entries")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("entry_date", start_date.isoformat())\
            .order("entry_date", desc=False)\
            .execute()

        entries = result.data or []

        return {
            "trend_data": entries,
            "date_range": {
                "from": start_date.isoformat(),
                "to": date.today().isoformat()
            },
            "metrics": {
                "avg_milk_score": sum(e.get("milk_score") or 0 for e in entries) / len(entries) if entries else 0,
                "avg_mood": sum(e.get("mood") or 0 for e in entries) / len(entries) if entries else 0,
                "avg_sleep": sum(e.get("sleep_hours") or 0 for e in entries) / len(entries) if entries else 0
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/challenges/{user_id}")
async def get_challenges(user_id: str, date_param: Optional[str] = Query(None), supabase = Depends(get_supabase)):
    """Get challenges for a specific date (default today)"""
    try:
        target_date = date_param or date.today().isoformat()

        result = supabase.table("wellness_challenges")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("challenge_date", target_date)\
            .execute()

        challenges = result.data or []

        # If no challenges exist for this date, create default ones
        if not challenges:
            default_challenges = [
                {"user_id": user_id, "challenge_type": "hydration", "challenge_text": "Drink 8 glasses of water", "challenge_date": target_date},
                {"user_id": user_id, "challenge_type": "movement", "challenge_text": "Take a 20-minute walk", "challenge_date": target_date},
                {"user_id": user_id, "challenge_type": "nutrition", "challenge_text": "Eat 5 servings of fruits/veggies", "challenge_date": target_date},
            ]

            insert_result = supabase.table("wellness_challenges").insert(default_challenges).execute()
            challenges = insert_result.data or []

        completed_count = sum(1 for c in challenges if c.get("completed"))

        return {
            "challenges": challenges,
            "completed": completed_count,
            "total": len(challenges),
            "date": target_date
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/streak/{user_id}")
async def get_streak(user_id: str, supabase = Depends(get_supabase)):
    """Calculate current streak (consecutive days with entries)"""
    try:
        result = supabase.table("wellness_entries")\
            .select("entry_date")\
            .eq("user_id", user_id)\
            .order("entry_date", desc=True)\
            .limit(30)\
            .execute()

        entries = result.data or []
        if not entries:
            return {"streak": 0, "last_entry": None}

        # Calculate streak
        streak = 0
        current_date = date.today()

        for entry in entries:
            entry_date = datetime.fromisoformat(entry["entry_date"]).date()
            if entry_date == current_date:
                streak += 1
                current_date -= timedelta(days=1)
            else:
                break

        last_entry_date = datetime.fromisoformat(entries[0]["entry_date"]).date()

        return {
            "streak": streak,
            "last_entry": last_entry_date.isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ==================== POST Endpoints ====================

@router.post("/profile/{user_id}")
async def update_wellness_profile(user_id: str, data: WellnessProfileUpdate, supabase = Depends(get_supabase)):
    """Create or update wellness profile"""
    try:
        # Check if profile exists
        check_result = supabase.table("wellness_profiles").select("id").eq("user_id", user_id).execute()

        update_data = data.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()

        if check_result.data:
            # Update existing
            result = supabase.table("wellness_profiles")\
                .update(update_data)\
                .eq("user_id", user_id)\
                .execute()
        else:
            # Create new
            update_data["user_id"] = user_id
            result = supabase.table("wellness_profiles").insert(update_data).execute()

        if result.data:
            return {"status": "success", "profile": result.data[0]}

        raise HTTPException(status_code=400, detail="Failed to update profile")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/entries/{user_id}")
async def create_wellness_entry(user_id: str, data: WellnessEntryCreate, supabase = Depends(get_supabase)):
    """Create or update daily wellness entry"""
    try:
        entry_date = (data.entry_date or date.today()).isoformat()

        # Check if entry exists for this date
        check_result = supabase.table("wellness_entries")\
            .select("id")\
            .eq("user_id", user_id)\
            .eq("entry_date", entry_date)\
            .execute()

        entry_data = {
            "user_id": user_id,
            "entry_date": entry_date,
            "milk_score": data.milk_score,
            "mood": data.mood,
            "sleep_hours": data.sleep_hours,
            "water_intake_ml": data.water_intake_ml,
            "energy_level": data.energy_level,
            "notes": data.notes,
            "updated_at": datetime.utcnow().isoformat()
        }

        if check_result.data:
            # Update existing
            result = supabase.table("wellness_entries")\
                .update(entry_data)\
                .eq("user_id", user_id)\
                .eq("entry_date", entry_date)\
                .execute()
        else:
            # Create new
            result = supabase.table("wellness_entries").insert(entry_data).execute()

        if result.data:
            return {"status": "created", "entry": result.data[0]}

        raise HTTPException(status_code=400, detail="Failed to create entry")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/challenges/{user_id}/complete")
async def complete_challenge(user_id: str, challenge_id: str, completed: bool = True, supabase = Depends(get_supabase)):
    """Mark a challenge as completed/uncompleted"""
    try:
        update_data = {
            "completed": completed,
            "completed_at": datetime.utcnow().isoformat() if completed else None
        }

        result = supabase.table("wellness_challenges")\
            .update(update_data)\
            .eq("id", challenge_id)\
            .eq("user_id", user_id)\
            .execute()

        if result.data:
            return {"status": "updated", "challenge": result.data[0]}

        raise HTTPException(status_code=404, detail="Challenge not found")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/consultation")
async def request_consultation(user_id: str, message: str, supabase = Depends(get_supabase)):
    """Submit consultation request (creates notification for admin)"""
    try:
        # Get user info
        user_result = supabase.table("users").select("email,full_name").eq("id", user_id).execute()

        if not user_result.data:
            raise HTTPException(status_code=404, detail="User not found")

        user = user_result.data[0]

        # Create notification for admin (simplified - could send email instead)
        notification = {
            "user_id": user_id,
            "type": "wellness_consultation",
            "title": f"Wellness Consultation Request from {user['full_name']}",
            "message": message,
            "data": {"email": user["email"], "full_name": user["full_name"]}
        }

        supabase.table("notifications").insert(notification).execute()

        return {"status": "submitted", "message": "Your consultation request has been sent"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
