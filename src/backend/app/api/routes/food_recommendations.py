from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict
from app.services.food_recommendation_service import get_full_day_recommendations, list_profiles
from pydantic import BaseModel

router = APIRouter()

class RecommendRequest(BaseModel):
    profile_stt: int
    locked_meals: Optional[Dict[str, List[int]]] = None
    excluded: Optional[List[int]] = None

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
    """
    results = get_full_day_recommendations(
        request.profile_stt, 
        request.locked_meals, 
        request.excluded
    )
    
    if isinstance(results, dict) and "error" in results:
        status_code = 404 if "not found" in results["error"] else 500
        raise HTTPException(status_code=status_code, detail=results["error"])
        
    return {"plans": results}
