from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import create_access_token
from app.core.supabase_client import get_supabase
from app.schemas.user import TokenResponse, UserCreate, UserResponse

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, supabase = Depends(get_supabase)):
    # Check if user exists
    result = supabase.table("users").select("*").eq("email", user_data.email).execute()
    
    if result.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user in Supabase Auth
    auth_response = supabase.auth.sign_up({
        "email": user_data.email,
        "password": user_data.password,
        "options": {
            "data": {
                "full_name": user_data.full_name,
                "role": user_data.role
            }
        }
    })
    
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Failed to create user")
    
    # Create user profile in database
    user_id = auth_response.user.id
    supabase.table("users").insert({
        "id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "role": user_data.role
    }).execute()
    
    return {
        "id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "is_active": True
    }

@router.post("/login", response_model=TokenResponse)
async def login(email: str, password: str, supabase = Depends(get_supabase)):
    # Authenticate with Supabase
    auth_response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    
    if not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Get user role
    user_result = supabase.table("users").select("role").eq("id", auth_response.user.id).execute()
    role = user_result.data[0]["role"] if user_result.data else "mother"
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": str(auth_response.user.id), "role": role},
        expires_delta=timedelta(minutes=30)
    )
    
    return {"access_token": access_token}

