from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class PartnershipCreate(BaseModel):
    partner_email: str
    partner_phone: Optional[str] = None

@router.post("/request")
async def request_partnership(user_id: str, request: PartnershipCreate, supabase = Depends(get_supabase)):
    """Request a partnership with another user"""
    # Find partner by email or phone
    query = supabase.table("users").select("id")
    
    if request.partner_email:
        query = query.eq("email", request.partner_email)
    elif request.partner_phone:
        query = query.eq("phone", request.partner_phone)
    else:
        raise HTTPException(status_code=400, detail="Email or phone required")
    
    partner_result = query.execute()
    
    if not partner_result.data:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    partner_id = partner_result.data[0]["id"]
    
    # Create partnership request
    result = supabase.table("partnerships").insert({
        "mother_id": user_id,
        "father_id": partner_id,
        "status": "pending"
    }).execute()
    
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create partnership request")
    
    return {"status": "created", "data": result.data[0]}

@router.get("/pending")
async def get_pending_partnerships(user_id: str, supabase = Depends(get_supabase)):
    """Get pending partnership requests for a user"""
    result = supabase.table("partnerships").select("*").eq("mother_id", user_id).eq("status", "pending").execute()
    return {"partnerships": result.data or []}

@router.get("/active")
async def get_active_partnership(user_id: str, supabase = Depends(get_supabase)):
    """Get active partnership for a user"""
    result = supabase.table("partnerships").select("*").or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}").eq("status", "accepted").execute()
    
    if not result.data:
        return {"partnership": None}
    
    return {"partnership": result.data[0]}

@router.post("/{partnership_id}/respond")
async def respond_partnership(partnership_id: str, action: str, supabase = Depends(get_supabase)):
    """Respond to a partnership request (accept or reject)"""
    if action not in ["accept", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'accept' or 'reject'")

    new_status = "accepted" if action == "accept" else "rejected"

    result = supabase.table("partnerships").update({
        "status": new_status
    }).eq("id", partnership_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Partnership not found")

    partnership = result.data[0]

    # When accepted: link any solo babies from both partners to this partnership
    if new_status == "accepted":
        mother_id = partnership.get("mother_id")
        father_id = partnership.get("father_id")
        user_ids = [uid for uid in [mother_id, father_id] if uid]
        for uid in user_ids:
            supabase.table("babies").update({
                "partnership_id": partnership_id
            }).eq("created_by", uid).is_("partnership_id", "null").execute()

    return {"status": "updated", "data": partnership}

@router.get("/{partnership_id}")
async def get_partnership(partnership_id: str, supabase = Depends(get_supabase)):
    """Get partnership details"""
    result = supabase.table("partnerships").select("*").eq("id", partnership_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Partnership not found")
    
    partnership = result.data[0]
    
    # Get mother and father details
    mother_result = supabase.table("users").select("*").eq("id", partnership["mother_id"]).execute()
    father_result = supabase.table("users").select("*").eq("id", partnership["father_id"]).execute()
    
    return {
        "partnership": partnership,
        "mother": mother_result.data[0] if mother_result.data else None,
        "father": father_result.data[0] if father_result.data else None
    }

