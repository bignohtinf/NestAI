import logging
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.supabase_client import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter()


# -------------------------------------------------------
# SCHEMAS
# -------------------------------------------------------

class BabyCreate(BaseModel):
    name: str
    status: Optional[str] = 'pregnant'      # 'pregnant' | 'born'

    # Anchor dates — nguồn sự thật để tính tuần thai, KHÔNG lưu gestation_weeks
    lmp: Optional[str] = None               # Last Menstrual Period (ngày kinh cuối)
    edd: Optional[str] = None               # Expected Due Date (ngày dự sinh)

    # Thông tin cập nhật sau (không bắt buộc lúc tạo)
    mother_name: Optional[str] = None
    father_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    weight_at_birth: Optional[float] = None
    height_at_birth: Optional[float] = None
    blood_type: Optional[str] = None
    notes: Optional[str] = None


class BabyUpdate(BaseModel):
    name: Optional[str] = None

    # Anchor dates (cập nhật nếu cần)
    lmp: Optional[str] = None
    edd: Optional[str] = None

    # Cập nhật khi bé chào đời
    status: Optional[str] = None           # 'pregnant' → 'born'
    date_of_birth: Optional[str] = None
    weight_at_birth: Optional[float] = None
    height_at_birth: Optional[float] = None

    # Cập nhật bất kỳ lúc nào
    mother_name: Optional[str] = None
    father_name: Optional[str] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    notes: Optional[str] = None


class DailyEntryCreate(BaseModel):
    entry_date: str
    milk_score: Optional[float] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    notes: Optional[str] = None


# -------------------------------------------------------
# HELPERS
# -------------------------------------------------------

def calculate_live_pregnancy(lmp_str: Optional[str], edd_str: Optional[str]) -> dict:
    """
    Tính tuần thai, số ngày lẻ và tam cá nguyệt từ LMP hoặc EDD.
    Trả về dict với: gestation_weeks, days_in_week, trimester (hoặc None nếu không đủ dữ liệu).
    """
    today = date.today()

    weeks = None
    days_in_week = None
    due_date = edd_str

    if lmp_str:
        try:
            lmp = date.fromisoformat(lmp_str)
            days_diff = (today - lmp).days
            weeks = max(0, min(42, days_diff // 7))
            days_in_week = max(0, days_diff % 7)
            if not due_date:
                from datetime import timedelta
                due_date = (lmp + timedelta(days=280)).isoformat()
        except Exception as e:
            logger.warning(f"calculate_live_pregnancy: failed to parse lmp '{lmp_str}': {e}")

    elif edd_str:
        try:
            edd = date.fromisoformat(edd_str)
            days_to_due = (edd - today).days
            total_days = 280 - days_to_due
            weeks = max(0, min(42, total_days // 7))
            days_in_week = max(0, total_days % 7)
        except Exception as e:
            logger.warning(f"calculate_live_pregnancy: failed to parse edd '{edd_str}': {e}")

    if weeks is None:
        return {}

    if weeks <= 13:
        trimester = 1
    elif weeks <= 26:
        trimester = 2
    else:
        trimester = 3

    return {
        "gestation_weeks": weeks,
        "days_in_week": days_in_week,
        "trimester": trimester,
        "due_date": due_date,
    }


def enrich_baby(baby: dict) -> dict:
    """Thêm tuần thai tính live vào bản ghi baby (chỉ khi status = 'pregnant')."""
    if baby.get("status") == "pregnant":
        calc = calculate_live_pregnancy(baby.get("lmp"), baby.get("edd"))
        if calc:
            baby = {**baby, **calc}
    return baby


# -------------------------------------------------------
# ENDPOINTS
# -------------------------------------------------------

@router.get("/")
async def get_babies(user_id: str, supabase=Depends(get_supabase)):
    """
    Trả về danh sách babies của user:
    1. Từ partnership đang accepted — babies gắn partnership_id
    2. Từ created_by = user_id (solo, chưa có partnership)
    3. Từ partner qua partnership (babies partner tạo trước khi kết nối, chưa gắn partnership_id)
    Tuần thai được tính live từ lmp/edd, không lưu trong DB.
    """
    try:
        babies: list = []
        seen_ids: set = set()

        # 1. Tìm partnership accepted
        partnership_res = supabase.table("partnerships") \
            .select("id, mother_id, father_id") \
            .eq("status", "accepted") \
            .or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}") \
            .execute()

        partner_id = None
        partnership_id = None

        if partnership_res.data:
            p = partnership_res.data[0]
            partnership_id = p["id"]
            # Xác định partner_id (người kia trong cặp)
            partner_id = p["father_id"] if p["mother_id"] == user_id else p["mother_id"]

            # 1a. Babies đã gắn partnership_id
            res = supabase.table("babies").select("*").eq("partnership_id", partnership_id).execute()
            for b in (res.data or []):
                babies.append(enrich_baby(b))
                seen_ids.add(b["id"])

        # 2. Babies solo (created_by user, chưa gắn partnership)
        res2 = supabase.table("babies").select("*").eq("created_by", user_id).execute()
        for b in (res2.data or []):
            if b["id"] not in seen_ids:
                # Nếu có partnership nhưng baby chưa gắn → tự động gắn
                if partnership_id and not b.get("partnership_id"):
                    try:
                        supabase.table("babies").update({"partnership_id": partnership_id}).eq("id", b["id"]).execute()
                        b["partnership_id"] = partnership_id
                    except Exception as e:
                        logger.warning(f"get_babies: failed to auto-link baby {b['id']} to partnership {partnership_id}: {e}")
                babies.append(enrich_baby(b))
                seen_ids.add(b["id"])

        # 3. Babies của partner tạo trước khi kết nối (chưa gắn partnership_id)
        if partner_id:
            res3 = supabase.table("babies").select("*").eq("created_by", partner_id).execute()
            for b in (res3.data or []):
                if b["id"] not in seen_ids:
                    # Tự động gắn partnership_id
                    if partnership_id and not b.get("partnership_id"):
                        try:
                            supabase.table("babies").update({"partnership_id": partnership_id}).eq("id", b["id"]).execute()
                            b["partnership_id"] = partnership_id
                        except Exception as e:
                            logger.warning(f"get_babies: failed to auto-link partner's baby {b['id']} to partnership {partnership_id}: {e}")
                    babies.append(enrich_baby(b))
                    seen_ids.add(b["id"])

        return {"babies": babies}

    except Exception as e:
        logger.error(f"get_babies failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/")
async def create_baby(user_id: str, baby: BabyCreate, supabase=Depends(get_supabase)):
    """
    Tạo hồ sơ bé.
    - Tự động gắn vào partnership nếu đã có.
    - Lưu lmp/edd làm anchor dates (tuần thai sẽ tính live, KHÔNG lưu gestation_weeks).
    - Nếu mẹ tạo baby và có LMP, cập nhật last_menstrual_period trong medical_profile của mẹ.
    """
    try:
        # Tìm partnership đang active
        partnership_res = supabase.table("partnerships") \
            .select("id, mother_id, father_id") \
            .eq("status", "accepted") \
            .or_(f"mother_id.eq.{user_id},father_id.eq.{user_id}") \
            .execute()

        partnership_id = None
        partnership_data = None
        if partnership_res.data:
            partnership_data = partnership_res.data[0]
            partnership_id = partnership_data["id"]

        # Xây dựng data insert (KHÔNG có gestation_weeks)
        insert_data: dict = {
            "created_by": user_id,
            "name": baby.name,
            "status": baby.status or "pregnant",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        if partnership_id:
            insert_data["partnership_id"] = partnership_id

        # Anchor dates
        if baby.lmp:
            insert_data["lmp"] = baby.lmp
        if baby.edd:
            insert_data["edd"] = baby.edd

        # Thông tin tùy chọn
        if baby.mother_name:
            insert_data["mother_name"] = baby.mother_name
        if baby.father_name:
            insert_data["father_name"] = baby.father_name
        if baby.gender:
            insert_data["gender"] = baby.gender
        if baby.date_of_birth:
            insert_data["date_of_birth"] = baby.date_of_birth
        if baby.weight_at_birth is not None:
            insert_data["weight_at_birth"] = baby.weight_at_birth
        if baby.height_at_birth is not None:
            insert_data["height_at_birth"] = baby.height_at_birth
        if baby.blood_type:
            insert_data["blood_type"] = baby.blood_type
        if baby.notes:
            insert_data["notes"] = baby.notes

        result = supabase.table("babies").insert(insert_data).execute()

        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create baby record")

        created = result.data[0]

        # Sync pregnancy_status + anchor dates sang medical_profile của MẸ
        # Luôn sync khi baby.status == "pregnant" (không cần lmp/edd truyền vào)
        if baby.status == "pregnant":
            try:
                mother_id = None
                user_res = supabase.table("users").select("role").eq("id", user_id).single().execute()
                if user_res.data:
                    if user_res.data["role"] == "mother":
                        mother_id = user_id
                    elif user_res.data["role"] == "father" and partnership_data:
                        mother_id = partnership_data.get("mother_id")

                if mother_id:
                    # Lấy lmp/edd từ input hoặc từ baby vừa tạo (created)
                    sync_lmp = baby.lmp or created.get("lmp")
                    sync_edd = baby.edd or created.get("edd") or created.get("due_date")

                    profile_update = {
                        "user_id": mother_id,
                        "pregnancy_status": "pregnant",
                        "updated_at": datetime.utcnow().isoformat(),
                    }
                    if sync_lmp:
                        profile_update["last_menstrual_period"] = sync_lmp
                    if sync_edd:
                        profile_update["due_date"] = sync_edd

                    supabase.table("medical_profiles").upsert(
                        profile_update, on_conflict="user_id"
                    ).execute()
                    logger.info(f"Synced medical_profile for mother {mother_id}: pregnant, edd={sync_edd}")
            except Exception as sync_err:
                logger.warning(f"Sync medical_profile failed: {sync_err}")

        return {"status": "created", "data": enrich_baby(created)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"create_baby failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{baby_id}")
async def get_baby(baby_id: str, supabase=Depends(get_supabase)):
    """Lấy chi tiết bé, bao gồm tuần thai tính live."""
    result = supabase.table("babies").select("*").eq("id", baby_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Baby not found")

    return {"baby": enrich_baby(result.data[0])}


@router.put("/{baby_id}")
async def update_baby(baby_id: str, baby: BabyUpdate, supabase=Depends(get_supabase)):
    """
    Cập nhật thông tin bé.
    - Không nhận gestation_weeks (tuần thai luôn tính live).
    - Nếu cập nhật lmp/edd, sync anchor dates sang medical_profile của mẹ.
    """
    update_data: dict = {}

    if baby.name is not None:
        update_data["name"] = baby.name
    if baby.lmp is not None:
        update_data["lmp"] = baby.lmp
    if baby.edd is not None:
        update_data["edd"] = baby.edd
    if baby.status is not None:
        update_data["status"] = baby.status
    if baby.date_of_birth is not None:
        update_data["date_of_birth"] = baby.date_of_birth
    if baby.gender is not None:
        update_data["gender"] = baby.gender
    if baby.weight_at_birth is not None:
        update_data["weight_at_birth"] = baby.weight_at_birth
    if baby.height_at_birth is not None:
        update_data["height_at_birth"] = baby.height_at_birth
    if baby.mother_name is not None:
        update_data["mother_name"] = baby.mother_name
    if baby.father_name is not None:
        update_data["father_name"] = baby.father_name
    if baby.blood_type is not None:
        update_data["blood_type"] = baby.blood_type
    if baby.notes is not None:
        update_data["notes"] = baby.notes

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow().isoformat()

    result = supabase.table("babies").update(update_data).eq("id", baby_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Baby not found")

    updated = result.data[0]

    # Sync pregnancy_status + anchor dates sang medical_profile của mẹ
    # Sync khi: update lmp/edd, hoặc status vẫn/chuyển thành "pregnant"
    if updated.get("status") == "pregnant":
        try:
            creator_id = updated.get("created_by")
            mother_id = None

            user_res = supabase.table("users").select("role").eq("id", creator_id).single().execute()
            if user_res.data:
                if user_res.data["role"] == "mother":
                    mother_id = creator_id
                elif user_res.data["role"] == "father":
                    p_res = supabase.table("partnerships") \
                        .select("mother_id") \
                        .eq("father_id", creator_id) \
                        .eq("status", "accepted") \
                        .execute()
                    if p_res.data:
                        mother_id = p_res.data[0]["mother_id"]

            if mother_id:
                sync_lmp = baby.lmp or updated.get("lmp")
                sync_edd = baby.edd or updated.get("edd") or updated.get("due_date")

                profile_update = {
                    "user_id": mother_id,
                    "pregnancy_status": "pregnant",
                    "updated_at": datetime.utcnow().isoformat(),
                }
                if sync_lmp:
                    profile_update["last_menstrual_period"] = sync_lmp
                if sync_edd:
                    profile_update["due_date"] = sync_edd

                supabase.table("medical_profiles").upsert(
                    profile_update, on_conflict="user_id"
                ).execute()
                logger.info(f"Synced medical_profile for mother {mother_id}: pregnant, edd={sync_edd}")
        except Exception as sync_err:
            logger.warning(f"Sync medical_profile on update failed: {sync_err}")

    return {"status": "updated", "data": enrich_baby(updated)}


@router.delete("/{baby_id}")
async def delete_baby(baby_id: str, supabase=Depends(get_supabase)):
    """
    Xóa hồ sơ bé.
    Sau khi xóa, re-sync medical_profiles:
    - Nếu còn baby pregnant khác → sync lmp/edd của baby đó lên medical_profiles
    - Nếu không còn baby pregnant nào → xóa anchor dates, set pregnancy_status = not_pregnant
    """
    if not baby_id or baby_id == "undefined":
        raise HTTPException(status_code=400, detail="Invalid baby ID")

    try:
        import uuid
        uuid.UUID(baby_id)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid UUID format: {baby_id}")

    try:
        # Xóa daily_entries trước để tránh FK constraint violation
        supabase.table("daily_entries").delete().eq("baby_id", baby_id).execute()

        result = supabase.table("babies").delete().eq("id", baby_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Baby not found")

        deleted_baby = result.data[0]

        # Re-sync medical_profiles sau khi xóa baby pregnant
        if deleted_baby.get("status") == "pregnant":
            try:
                creator_id = deleted_baby.get("created_by")
                partnership_id = deleted_baby.get("partnership_id")

                # Xác định mother_id
                mother_id = None
                if creator_id:
                    user_res = supabase.table("users").select("role").eq("id", creator_id).single().execute()
                    if user_res.data:
                        if user_res.data["role"] == "mother":
                            mother_id = creator_id
                        elif user_res.data["role"] == "father":
                            if partnership_id:
                                p_res = supabase.table("partnerships") \
                                    .select("mother_id") \
                                    .eq("id", partnership_id) \
                                    .execute()
                                if p_res.data:
                                    mother_id = p_res.data[0]["mother_id"]
                            else:
                                p_res = supabase.table("partnerships") \
                                    .select("mother_id") \
                                    .eq("father_id", creator_id) \
                                    .eq("status", "accepted") \
                                    .execute()
                                if p_res.data:
                                    mother_id = p_res.data[0]["mother_id"]

                if mother_id:
                    # Tìm baby pregnant còn lại (đã xóa rồi nên query này sẽ không trả về baby vừa xóa)
                    remaining_query = supabase.table("babies") \
                        .select("*") \
                        .eq("status", "pregnant")
                    if partnership_id:
                        remaining_query = remaining_query.eq("partnership_id", partnership_id)
                    else:
                        remaining_query = remaining_query.eq("created_by", creator_id)

                    remaining_res = remaining_query.execute()
                    remaining_babies = remaining_res.data or []

                    if remaining_babies:
                        # Còn baby pregnant khác → sync lmp/edd của baby đó lên medical_profiles
                        primary_baby = remaining_babies[0]
                        profile_update: dict = {
                            "user_id": mother_id,
                            "pregnancy_status": "pregnant",
                            "updated_at": datetime.utcnow().isoformat(),
                        }
                        if primary_baby.get("lmp"):
                            profile_update["last_menstrual_period"] = primary_baby["lmp"]
                        else:
                            profile_update["last_menstrual_period"] = None
                        if primary_baby.get("edd"):
                            profile_update["due_date"] = primary_baby["edd"]
                        else:
                            profile_update["due_date"] = None

                        supabase.table("medical_profiles").upsert(
                            profile_update, on_conflict="user_id"
                        ).execute()
                        logger.info(
                            f"Re-synced medical_profile for mother {mother_id} "
                            f"to baby {primary_baby['id']} after deleting baby {baby_id}"
                        )
                    else:
                        # Không còn baby pregnant → clear pregnancy anchor dates
                        supabase.table("medical_profiles").upsert(
                            {
                                "user_id": mother_id,
                                "pregnancy_status": "not_pregnant",
                                "last_menstrual_period": None,
                                "due_date": None,
                                "updated_at": datetime.utcnow().isoformat(),
                            },
                            on_conflict="user_id"
                        ).execute()
                        logger.info(
                            f"Cleared medical_profile pregnancy data for mother {mother_id} "
                            f"after deleting last pregnant baby {baby_id}"
                        )
            except Exception as sync_err:
                logger.warning(f"Re-sync medical_profile after delete failed: {sync_err}")

        return {"status": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"delete_baby failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{baby_id}/entries")
async def get_daily_entries(baby_id: str, limit: int = 30, supabase=Depends(get_supabase)):
    """Lấy nhật ký hàng ngày của bé."""
    result = supabase.table("daily_entries") \
        .select("*") \
        .eq("baby_id", baby_id) \
        .order("entry_date", desc=True) \
        .limit(limit) \
        .execute()
    return {"entries": result.data or []}


@router.post("/{baby_id}/entries")
async def create_daily_entry(
    baby_id: str, user_id: str, entry: DailyEntryCreate, supabase=Depends(get_supabase)
):
    """Tạo nhật ký hàng ngày cho bé."""
    result = supabase.table("daily_entries").insert({
        "baby_id": baby_id,
        "recorded_by": user_id,
        "entry_date": entry.entry_date,
        "milk_score": entry.milk_score,
        "weight": entry.weight,
        "height": entry.height,
        "notes": entry.notes,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create daily entry")

    return {"status": "created", "data": result.data[0]}


@router.get("/{baby_id}/milestones")
async def get_milestones(baby_id: str, supabase=Depends(get_supabase)):
    """Lấy các cột mốc phát triển của bé."""
    return {"milestones": []}


@router.post("/{baby_id}/milestones/{milestone_id}/achieve")
async def achieve_milestone(baby_id: str, milestone_id: str, supabase=Depends(get_supabase)):
    """Đánh dấu cột mốc đã đạt được."""
    raise HTTPException(status_code=501, detail="Milestones feature not yet implemented")
