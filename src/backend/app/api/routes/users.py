from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserUpdate(BaseModel):
    phone: Optional[str] = None
    dob: Optional[str] = None
    allergies: Optional[list[str]] = None
    dislikes: Optional[list[str]] = None

@router.get("/me")
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
        "phone": user.get("phone"),
        "dob": user.get("dob"),
        "allergies": user.get("allergies", []),
        "dislikes": user.get("dislikes", []),
        "is_active": True
    }

@router.put("/me")
async def update_current_user(user_id: str, user_data: UserUpdate, supabase = Depends(get_supabase)):
    update_data = {}

    if user_data.phone is not None:
        update_data["phone"] = user_data.phone
    if user_data.dob is not None:
        update_data["dob"] = user_data.dob
    if user_data.allergies is not None:
        update_data["allergies"] = user_data.allergies
    if user_data.dislikes is not None:
        update_data["dislikes"] = user_data.dislikes

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
            "phone": user.get("phone"),
            "dob": user.get("dob"),
            "allergies": user.get("allergies", []),
            "dislikes": user.get("dislikes", []),
        }
    }

