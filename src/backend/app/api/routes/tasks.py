from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.supabase_client import get_supabase

router = APIRouter()

class TaskCreate(BaseModel):
    title: str
    category: str  # 'health' | 'household' | 'emotional'
    priority: str  # 'urgent' | 'high' | 'normal'
    description: Optional[str] = None
    due_time: Optional[str] = None
    assigned_to: Optional[str] = None  # 'father' | 'mother'

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    due_time: Optional[str] = None
    completed: Optional[bool] = None

@router.get("/")
async def get_tasks(user_id: str, supabase = Depends(get_supabase)):
    """Get all tasks for a user's partnership"""
    try:
        # Get partnership
        partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
        
        if not partnership_result.data:
            return {"tasks": []}
        
        partnership_id = partnership_result.data[0]["id"]
        
        # Get tasks for this partnership
        result = supabase.table("tasks").select("*").eq("partnership_id", partnership_id).order("priority", desc=True).execute()
        return {"tasks": result.data or []}
    except Exception as e:
        print(f"Error in get_tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/")
async def create_task(user_id: str, task: TaskCreate, supabase = Depends(get_supabase)):
    """Create a new task"""
    try:
        # Get partnership
        partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
        
        if not partnership_result.data:
            raise HTTPException(status_code=404, detail="No active partnership found")
        
        partnership_id = partnership_result.data[0]["id"]
        
        result = supabase.table("tasks").insert({
            "partnership_id": partnership_id,
            "title": task.title,
            "category": task.category,
            "priority": task.priority,
            "description": task.description,
            "due_time": task.due_time,
            "assigned_to": task.assigned_to,
            "completed": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create task")
        
        return {"status": "created", "data": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in create_task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{task_id}")
async def get_task(task_id: str, supabase = Depends(get_supabase)):
    """Get a specific task"""
    try:
        result = supabase.table("tasks").select("*").eq("id", task_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"task": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/{task_id}")
async def update_task(task_id: str, update: TaskUpdate, supabase = Depends(get_supabase)):
    """Update a task"""
    try:
        update_data = {}
        
        if update.title is not None:
            update_data["title"] = update.title
        if update.category is not None:
            update_data["category"] = update.category
        if update.priority is not None:
            update_data["priority"] = update.priority
        if update.description is not None:
            update_data["description"] = update.description
        if update.due_time is not None:
            update_data["due_time"] = update.due_time
        if update.completed is not None:
            update_data["completed"] = update.completed
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        if not update_data or len(update_data) == 1:  # Only updated_at
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = supabase.table("tasks").update(update_data).eq("id", task_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"status": "updated", "data": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/{task_id}")
async def delete_task(task_id: str, supabase = Depends(get_supabase)):
    """Delete a task"""
    try:
        result = supabase.table("tasks").delete().eq("id", task_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Task not found")
        
        return {"status": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/today/pending")
async def get_today_pending_tasks(user_id: str, supabase = Depends(get_supabase)):
    """Get pending tasks for today"""
    try:
        from datetime import date
        date.today().isoformat()
        
        # Get partnership
        partnership_result = supabase.table("partnerships").select("id").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
        
        if not partnership_result.data:
            return {"tasks": []}
        
        partnership_id = partnership_result.data[0]["id"]
        
        # Get pending tasks
        result = supabase.table("tasks").select("*").eq("partnership_id", partnership_id).eq("completed", False).order("priority", desc=True).execute()
        
        return {"tasks": result.data or []}
    except Exception as e:
        print(f"Error in get_today_pending_tasks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
