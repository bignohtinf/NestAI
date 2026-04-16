from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional

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
    # Get partnership
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        raise HTTPException(status_code=404, detail="No active partnership found")
    
    partnership_id = partnership_result.data[0]["id"]
    
    # Get current budget
    result = supabase.table("budgets").select("*").eq("partnership_id", partnership_id).order("week_start", desc=True).limit(1).execute()
    
    if not result.data:
        return {"budget": None}
    
    budget = result.data[0]
    
    # Get expenses for this budget
    expenses_result = supabase.table("expenses").select("*").eq("budget_id", budget["id"]).execute()
    expenses = expenses_result.data or []
    
    return {
        "budget": budget,
        "expenses": expenses,
        "remaining": budget.get("weekly_limit", 0) - budget.get("spent", 0)
    }

@router.post("/budget")
async def create_budget(user_id: str, budget_data: BudgetCreate, supabase = Depends(get_supabase)):
    """Create a new budget"""
    # Get partnership
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        raise HTTPException(status_code=404, detail="No active partnership found")
    
    partnership_id = partnership_result.data[0]["id"]
    
    from datetime import datetime
    result = supabase.table("budgets").insert({
        "partnership_id": partnership_id,
        "weekly_limit": budget_data.weekly_limit,
        "spent": 0,
        "week_start": datetime.utcnow().isoformat()
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create budget")
    
    return {"status": "created", "data": result.data[0]}

@router.post("/expense")
async def add_expense(user_id: str, expense: ExpenseCreate, supabase = Depends(get_supabase)):
    """Add an expense to the current budget"""
    # Get partnership
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        raise HTTPException(status_code=404, detail="No active partnership found")
    
    partnership_id = partnership_result.data[0]["id"]
    
    # Get current budget
    budget_result = supabase.table("budgets").select("*").eq("partnership_id", partnership_id).order("week_start", desc=True).limit(1).execute()
    
    if not budget_result.data:
        raise HTTPException(status_code=404, detail="No budget found")
    
    budget_id = budget_result.data[0]["id"]
    
    # Add expense
    result = supabase.table("expenses").insert({
        "budget_id": budget_id,
        "amount": expense.amount,
        "category": expense.category,
        "description": expense.description
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to add expense")
    
    # Update budget spent amount
    current_spent = budget_result.data[0].get("spent", 0)
    supabase.table("budgets").update({
        "spent": current_spent + expense.amount
    }).eq("id", budget_id).execute()
    
    return {"status": "created", "data": result.data[0]}

@router.get("/expenses")
async def get_expenses(user_id: str, limit: int = 30, supabase = Depends(get_supabase)):
    """Get recent expenses"""
    # Get partnership
    partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not partnership_result.data:
        return {"expenses": []}
    
    partnership_id = partnership_result.data[0]["id"]
    
    # Get current budget
    budget_result = supabase.table("budgets").select("*").eq("partnership_id", partnership_id).order("week_start", desc=True).limit(1).execute()
    
    if not budget_result.data:
        return {"expenses": []}
    
    budget_id = budget_result.data[0]["id"]
    
    # Get expenses
    result = supabase.table("expenses").select("*").eq("budget_id", budget_id).order("created_at", desc=True).limit(limit).execute()
    
    return {"expenses": result.data or []}

