from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from app.schemas.user import UserResponse
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    weeksPostpartum: Optional[int] = None

@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: str, supabase = Depends(get_supabase)):
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = result.data[0]
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "is_active": True
    }

@router.put("/me")
async def update_current_user(user_id: str, user_data: UserUpdate, supabase = Depends(get_supabase)):
    """Update current user profile"""
    update_data = {}
    
    if user_data.name is not None:
        update_data["full_name"] = user_data.name
    if user_data.age is not None:
        update_data["age"] = user_data.age
    if user_data.weeksPostpartum is not None:
        update_data["weeks_postpartum"] = user_data.weeksPostpartum
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = supabase.table("users").update(update_data).eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = result.data[0]
    return {
        "status": "updated",
        "data": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"],
            "is_active": True
        }
    }

