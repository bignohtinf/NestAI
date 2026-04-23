from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter()

class BudgetCreate(BaseModel):
    weekly_limit: float

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None

@router.get("/budget")
async def get_budget(user_id: str, supabase = Depends(get_supabase)):
    """Get current budget for a user"""
    # Placeholder - budgets table not yet created
    return {"budget": None, "expenses": [], "remaining": 0}

@router.post("/budget")
async def create_budget(user_id: str, budget_data: BudgetCreate, supabase = Depends(get_supabase)):
    """Create a new budget"""
    # Placeholder - budgets table not yet created
    raise HTTPException(status_code=501, detail="Budget feature not yet implemented")

@router.post("/expense")
async def add_expense(user_id: str, expense: ExpenseCreate, supabase = Depends(get_supabase)):
    """Add an expense to the current budget"""
    # Placeholder - expenses table not yet created
    raise HTTPException(status_code=501, detail="Expense feature not yet implemented")

@router.get("/expenses")
async def get_expenses(user_id: str, limit: int = 30, supabase = Depends(get_supabase)):
    """Get recent expenses"""
    # Placeholder - expenses table not yet created
    return {"expenses": []}

@router.get("/stats")
async def get_admin_stats(supabase = Depends(get_supabase)):
    """Get system statistics for admin dashboard"""
    try:
        # Get total users
        users_result = supabase.table("users").select("id, role").execute()
        total_users = len(users_result.data or [])
        
        # Count by role
        users_data = users_result.data or []
        total_admins = len([u for u in users_data if u.get("role") == "admin"])
        total_mothers = len([u for u in users_data if u.get("role") == "mother"])
        total_fathers = len([u for u in users_data if u.get("role") == "father"])
        
        # Get total partnerships
        partnerships_result = supabase.table("partnerships").select("id").eq("status", "accepted").execute()
        total_partnerships = len(partnerships_result.data or [])
        
        # Get total babies
        babies_result = supabase.table("babies").select("id").execute()
        total_babies = len(babies_result.data or [])
        
        # Get active users (logged in last 7 days)
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        active_result = supabase.table("users").select("id").gt("last_login", seven_days_ago).execute()
        active_users = len(active_result.data or [])
        
        return {
            "totalUsers": total_users,
            "totalAdmins": total_admins,
            "totalMothers": total_mothers,
            "totalFathers": total_fathers,
            "activeUsers": active_users,
            "totalPartnerships": total_partnerships,
            "totalBabies": total_babies,
        }
    except Exception as e:
        print(f"Error in get_admin_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/spending-breakdown")
async def get_spending_breakdown(user_id: str, supabase = Depends(get_supabase)):
    """Get spending breakdown by category"""
    # Placeholder - expenses table not yet created
    return {
        "food": 0,
        "supplements": 0,
        "other": 0,
    }

@router.get("/nutrition-database")
async def get_nutrition_database(limit: int = 100, offset: int = 0, supabase = Depends(get_supabase)):
    """Get nutrition database with foods and their nutritional values"""
    try:
        # Fetch foods from nutrition_database table
        result = supabase.table("nutrition_database").select(
            "id, name, calories, protein, carbs, fat, fiber, price, category, serving_size, unit"
        ).range(offset, offset + limit - 1).execute()
        
        foods = result.data or []
        
        # Get total count
        count_result = supabase.table("nutrition_database").select("id", count="exact").execute()
        total = count_result.count or 0
        
        return {
            "foods": foods,
            "total": total,
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        print(f"Error fetching nutrition database: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/nutrition-database")
async def add_nutrition_item(
    name: str,
    calories: float,
    protein: float,
    carbs: float,
    fat: float,
    fiber: float,
    price: float,
    category: str,
    serving_size: float,
    unit: str,
    supabase = Depends(get_supabase)
):
    """Add a new item to nutrition database"""
    try:
        result = supabase.table("nutrition_database").insert({
            "name": name,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fat": fat,
            "fiber": fiber,
            "price": price,
            "category": category,
            "serving_size": serving_size,
            "unit": unit,
        }).execute()
        
        return {"success": True, "data": result.data}
    except Exception as e:
        print(f"Error adding nutrition item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/nutrition-database/{food_id}")
async def delete_nutrition_item(food_id: str, supabase = Depends(get_supabase)):
    """Delete an item from nutrition database"""
    try:
        supabase.table("nutrition_database").delete().eq("id", food_id).execute()
        return {"success": True}
    except Exception as e:
        print(f"Error deleting nutrition item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

