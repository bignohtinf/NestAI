from fastapi import APIRouter, Depends, HTTPException
from app.core.supabase_client import get_supabase
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime, timedelta

router = APIRouter()


# -------------------------------------------------------
# SCHEMAS
# -------------------------------------------------------

class MedicalProfileUpdate(BaseModel):
    pregnancy_status: Optional[str] = None
    last_menstrual_period: Optional[date] = None   # Anchor date của MẸ
    due_date: Optional[date] = None                 # Anchor date, được sync sang bố
    current_weight_kg: Optional[float] = None
    pre_pregnancy_weight_kg: Optional[float] = None
    height_cm: Optional[float] = None


# -------------------------------------------------------
# HELPER: Tính tuần thai từ anchor dates
# -------------------------------------------------------

def calculate_pregnancy_info(lmp=None, due_date=None) -> Optional[dict]:
    """
    Tính tuần thai, số ngày lẻ trong tuần và tam cá nguyệt từ LMP hoặc EDD.
    - Ưu tiên LMP (chính xác hơn).
    - Nếu không có LMP thì dùng due_date.
    - Trả về None nếu không có đủ dữ liệu.
    KHÔNG lưu các giá trị này vào DB — chỉ trả về trong response.
    """
    today = date.today()

    # Normalize to date objects
    if isinstance(lmp, str):
        try:
            lmp = date.fromisoformat(lmp)
        except Exception:
            lmp = None
    if isinstance(due_date, str):
        try:
            due_date = date.fromisoformat(due_date)
        except Exception:
            due_date = None

    weeks = None
    days_in_week = None
    computed_due_date = due_date

    if lmp:
        if not computed_due_date:
            computed_due_date = lmp + timedelta(days=280)
        days_diff = (today - lmp).days
        weeks = max(0, min(42, days_diff // 7))
        days_in_week = max(0, days_diff % 7)

    elif due_date:
        days_to_due = (due_date - today).days
        total_days = 280 - days_to_due
        weeks = max(0, min(42, total_days // 7))
        days_in_week = max(0, total_days % 7)

    if weeks is None:
        return None

    if weeks <= 13:
        trimester = 1
    elif weeks <= 26:
        trimester = 2
    else:
        trimester = 3

    return {
        "week_of_pregnancy": weeks,
        "days_in_week": days_in_week,
        "trimester": trimester,
        "due_date": computed_due_date.isoformat() if computed_due_date else None,
    }


# -------------------------------------------------------
# ENDPOINTS
# -------------------------------------------------------

@router.get("/me")
async def get_my_medical_profile(user_id: str, supabase=Depends(get_supabase)):
    """
    Lấy medical profile của user hiện tại.

    Logic tuần thai:
    - Nếu là MẸ: tính từ last_menstrual_period hoặc due_date của chính mình.
    - Nếu là BỐ: tìm thông tin qua partnership → lấy LMP/due_date từ profile của mẹ
      để tính tuần thai CÙNG kết quả với mẹ.
    - Tuần thai KHÔNG được lưu vào DB, chỉ tính live khi trả response.
    """
    try:
        # Lấy profile hiện tại
        result = supabase.table("medical_profiles") \
            .select("*") \
            .eq("user_id", user_id) \
            .execute()

        if not result.data:
            new_profile = {
                "user_id": user_id,
                "pregnancy_status": "not_pregnant",
            }
            insert_result = supabase.table("medical_profiles").insert(new_profile).execute()
            if not insert_result.data:
                raise HTTPException(status_code=500, detail="Failed to create medical profile")
            return {"profile": insert_result.data[0]}

        profile = result.data[0]

        # Nếu đang mang thai → tính tuần thai live
        if profile.get("pregnancy_status") == "pregnant":
            lmp = profile.get("last_menstrual_period")
            due_date = profile.get("due_date")

            # Nếu là BỐ và không có LMP riêng → lấy từ profile MẸ qua partnership
            if not lmp:
                try:
                    user_res = supabase.table("users").select("role").eq("id", user_id).single().execute()
                    if user_res.data and user_res.data["role"] == "father":
                        p_res = supabase.table("partnerships") \
                            .select("mother_id") \
                            .eq("father_id", user_id) \
                            .eq("status", "accepted") \
                            .execute()
                        if p_res.data:
                            mother_id = p_res.data[0]["mother_id"]
                            mother_profile_res = supabase.table("medical_profiles") \
                                .select("last_menstrual_period, due_date") \
                                .eq("user_id", mother_id) \
                                .execute()
                            if mother_profile_res.data:
                                mother_profile = mother_profile_res.data[0]
                                lmp = mother_profile.get("last_menstrual_period") or lmp
                                due_date = due_date or mother_profile.get("due_date")
                except Exception as e:
                    print(f"Could not fetch mother profile for father: {str(e)}")

            calc = calculate_pregnancy_info(lmp=lmp, due_date=due_date)
            if calc:
                # Gắn kết quả tính live vào response (KHÔNG ghi DB)
                profile = {**profile, **calc}

        return {"profile": profile}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/me")
async def update_my_medical_profile(
    user_id: str, data: MedicalProfileUpdate, supabase=Depends(get_supabase)
):
    """
    Cập nhật medical profile.

    Chỉ lưu anchor dates (last_menstrual_period, due_date, pregnancy_status).
    week_of_pregnancy, trimester, days_in_week KHÔNG được lưu vào DB.

    Sau khi update:
    - Nếu là MẸ: sync due_date và pregnancy_status sang profile của BỐ (qua partnership).
      KHÔNG sync tuần thai — bố sẽ tự tính live khi GET.
    - Sync anchor dates (lmp, edd) sang bản ghi baby đang pregnant.
    """
    try:
        update_data = data.model_dump(exclude_unset=True)

        # Chuyển date objects sang string cho Supabase
        if "last_menstrual_period" in update_data and update_data["last_menstrual_period"]:
            update_data["last_menstrual_period"] = update_data["last_menstrual_period"].isoformat()
        if "due_date" in update_data and update_data["due_date"]:
            update_data["due_date"] = update_data["due_date"].isoformat()

        # KHÔNG lưu week_of_pregnancy, trimester, days_in_week vào DB
        for computed_field in ["week_of_pregnancy", "trimester", "days_in_week"]:
            update_data.pop(computed_field, None)

        update_data["updated_at"] = datetime.utcnow().isoformat()

        result = supabase.table("medical_profiles").upsert(
            {"user_id": user_id, **update_data},
            on_conflict="user_id"
        ).execute()

        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update medical profile")

        profile = result.data[0]

        # Tính tuần thai live để trả về trong response (KHÔNG ghi DB)
        if profile.get("pregnancy_status") == "pregnant":
            calc = calculate_pregnancy_info(
                lmp=profile.get("last_menstrual_period"),
                due_date=profile.get("due_date"),
            )
            if calc:
                profile = {**profile, **calc}

        # ---------------------------------------------------
        # SYNC SANG PARTNER (BỐ): chỉ sync pregnancy_status và due_date
        # KHÔNG sync week_of_pregnancy, trimester, days_in_week (để tránh data stale)
        # ---------------------------------------------------
        try:
            p_res = supabase.table("partnerships") \
                .select("mother_id, father_id") \
                .or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}") \
                .eq("status", "accepted") \
                .execute()

            if p_res.data:
                partnership = p_res.data[0]
                partner_id = (
                    partnership["father_id"]
                    if partnership["mother_id"] == user_id
                    else partnership["mother_id"]
                )

                # Chỉ sync các anchor fields — KHÔNG sync tuần thai đã tính
                anchor_sync = {}
                if "pregnancy_status" in update_data:
                    anchor_sync["pregnancy_status"] = update_data["pregnancy_status"]
                if "due_date" in update_data:
                    anchor_sync["due_date"] = update_data["due_date"]

                if anchor_sync:
                    anchor_sync["updated_at"] = datetime.utcnow().isoformat()
                    supabase.table("medical_profiles").upsert(
                        {"user_id": partner_id, **anchor_sync},
                        on_conflict="user_id"
                    ).execute()

        except Exception as e:
            print(f"Partner sync failed: {str(e)}")

        # ---------------------------------------------------
        # NOTE: Không sync anchor dates từ medical_profiles về babies.
        # Mỗi baby lưu lmp/edd riêng trong bảng babies và là nguồn sự thật
        # của chính baby đó. Việc sync ngược (medical_profiles → babies) sẽ
        # gây lỗi khi có nhiều baby với tuần thai khác nhau — lmp của baby A
        # bị ghi đè bởi lmp của baby B khi user cập nhật medical_profiles.
        # Chiều sync hợp lệ duy nhất: baby → medical_profiles (xảy ra tại
        # create_baby, update_baby, và delete_baby).
        # ---------------------------------------------------

        return {"status": "updated", "profile": profile}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
