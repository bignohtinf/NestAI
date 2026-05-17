from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.supabase_client import get_supabase

router = APIRouter()


class PartnershipCreate(BaseModel):
    partner_email: Optional[str] = None
    partner_phone: Optional[str] = None


@router.post("/request")
async def request_partnership(user_id: str, request: PartnershipCreate, supabase=Depends(get_supabase)):
    """
    Gửi yêu cầu kết nối với đối phương.
    - Cả MẸ và BỐ đều có thể gửi yêu cầu.
    - Hệ thống tự xác định father_id / mother_id dựa theo role của từng user.
    - Yêu cầu: 1 người phải là 'father', 1 người phải là 'mother'.
    """
    if not request.partner_email and not request.partner_phone:
        raise HTTPException(status_code=400, detail="Email hoặc số điện thoại là bắt buộc")

    # Lấy role của người gửi
    requester_res = supabase.table("users") \
        .select("id, role") \
        .eq("id", user_id) \
        .single() \
        .execute()

    if not requester_res.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin người dùng")

    requester_role = requester_res.data["role"]

    # Tìm đối phương
    query = supabase.table("users").select("id, role")
    if request.partner_email:
        query = query.eq("email", request.partner_email)
    else:
        query = query.eq("phone", request.partner_phone)

    partner_res = query.single().execute()

    if not partner_res.data:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy tài khoản người dùng với thông tin đã nhập"
        )

    partner_id = partner_res.data["id"]
    partner_role = partner_res.data["role"]

    if partner_id == user_id:
        raise HTTPException(status_code=400, detail="Không thể kết nối với chính mình")

    # Xác định father_id / mother_id theo role
    if requester_role == "father" and partner_role == "mother":
        father_id = user_id
        mother_id = partner_id
    elif requester_role == "mother" and partner_role == "father":
        father_id = partner_id
        mother_id = user_id
    else:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Kết nối cần 1 tài khoản 'Bố' và 1 tài khoản 'Mẹ'. "
                f"Bạn là '{requester_role}', đối phương là '{partner_role}'."
            )
        )

    # Kiểm tra đã có partnership chưa
    existing_res = supabase.table("partnerships") \
        .select("id, status") \
        .or_(
            f"and(father_id.eq.{father_id},mother_id.eq.{mother_id}),"
            f"and(father_id.eq.{mother_id},mother_id.eq.{father_id})"
        ) \
        .in_("status", ["pending", "accepted"]) \
        .execute()

    if existing_res.data:
        existing_status = existing_res.data[0]["status"]
        msg = (
            "Đã có mối quan hệ với người dùng này"
            if existing_status == "accepted"
            else "Đã có yêu cầu kết nối đang chờ xử lý"
        )
        raise HTTPException(status_code=400, detail=msg)

    # Tạo partnership request
    result = supabase.table("partnerships").insert({
        "mother_id": mother_id,
        "father_id": father_id,
        "status": "pending",
        "requested_by": user_id,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Không thể gửi yêu cầu kết nối")

    return {
        "message": "Yêu cầu kết nối đã được gửi. Vui lòng chờ đối phương chấp nhận.",
        "data": result.data[0],
    }


@router.get("/pending")
async def get_pending_partnerships(user_id: str, supabase=Depends(get_supabase)):
    """
    Lấy danh sách yêu cầu kết nối đang chờ xử lý mà user nhận được
    (không bao gồm yêu cầu do chính user gửi đi).
    """
    result = supabase.table("partnerships") \
        .select("*") \
        .or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}") \
        .eq("status", "pending") \
        .neq("requested_by", user_id) \
        .execute()

    return {"partnerships": result.data or []}


@router.get("/active")
async def get_active_partnership(user_id: str, supabase=Depends(get_supabase)):
    """Lấy partnership đang active của user."""
    result = supabase.table("partnerships") \
        .select("*") \
        .or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}") \
        .eq("status", "accepted") \
        .execute()

    if not result.data:
        return {"partnership": None}

    return {"partnership": result.data[0]}


@router.post("/{partnership_id}/respond")
async def respond_partnership(
    partnership_id: str, action: str, supabase=Depends(get_supabase)
):
    """
    Phản hồi yêu cầu kết nối (accept / reject).
    Khi accepted: tự động gắn partnership_id cho các babies solo của cả hai.
    """
    if action not in ["accept", "reject"]:
        raise HTTPException(status_code=400, detail="Action phải là 'accept' hoặc 'reject'")

    new_status = "accepted" if action == "accept" else "rejected"

    result = supabase.table("partnerships") \
        .update({"status": new_status}) \
        .eq("id", partnership_id) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Partnership not found")

    partnership = result.data[0]

    # Khi accepted: gắn partnership_id cho babies solo của cả mẹ lẫn bố
    if new_status == "accepted":
        mother_id = partnership.get("mother_id")
        father_id = partnership.get("father_id")
        for uid in [uid for uid in [mother_id, father_id] if uid]:
            supabase.table("babies") \
                .update({"partnership_id": partnership_id}) \
                .eq("created_by", uid) \
                .is_("partnership_id", "null") \
                .execute()

    return {"status": "updated", "data": partnership}


@router.get("/{partnership_id}")
async def get_partnership(partnership_id: str, supabase=Depends(get_supabase)):
    """Lấy chi tiết một partnership, kèm thông tin mẹ và bố."""
    result = supabase.table("partnerships").select("*").eq("id", partnership_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Partnership not found")

    partnership = result.data[0]

    mother_res = supabase.table("users") \
        .select("id, full_name, email, phone, role") \
        .eq("id", partnership["mother_id"]) \
        .execute()

    father_res = supabase.table("users") \
        .select("id, full_name, email, phone, role") \
        .eq("id", partnership["father_id"]) \
        .execute()

    return {
        "partnership": partnership,
        "mother": mother_res.data[0] if mother_res.data else None,
        "father": father_res.data[0] if father_res.data else None,
    }
