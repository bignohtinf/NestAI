from typing import Optional, List
from app.schemas.admin_users import (
    UserListResponse, 
    UserDetailResponse, 
    MedicalProfileListResponse,
    UserSummary,
    UserDetail,
    UserStats,
    MedicalProfileSummary
)

class AdminUsersService:
    def __init__(self, supabase):
        self.supabase = supabase

    def get_users_list(
        self, 
        limit: int = 20, 
        offset: int = 0, 
        role: Optional[str] = None, 
        status: Optional[str] = None, 
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> UserListResponse:
        query = self.supabase.table("users").select("*", count="exact")
        
        # Apply filters only if provided
        if role and role != "all":
            query = query.eq("role", role)
        if status and status != "all":
            is_active = True if status == "active" else False
            query = query.eq("is_active", is_active)
        if search:
            query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%")
        
        # Mapping sort_by
        db_sort_by = "full_name" if sort_by == "name" else sort_by
        
        try:
            res = query.order(db_sort_by, desc=(sort_order == "desc")).range(offset, offset + limit - 1).execute()
        except Exception as e:
            return UserListResponse(users=[], total=0, limit=limit, offset=offset)

        users = []
        for u in (res.data or []):
            try:
                users.append(UserSummary(
                    id=u.get("id"),
                    email=u.get("email"),
                    name=u.get("full_name") or u.get("name") or "Unknown",
                    role=u.get("role", "user"),
                    status="active" if u.get("is_active") else "inactive",
                    createdAt=u.get("created_at"),
                    lastLogin=u.get("last_login"),
                    activeStatus=u.get("is_active", False)
                ))
            except Exception:
                pass
            
        return UserListResponse(
            users=users,
            total=res.count or 0,
            limit=limit,
            offset=offset
        )

    def get_user_detail(self, user_id: str) -> UserDetailResponse:
        try:
            # Use the view created in Migration 018 for aggregated stats
            view_res = self.supabase.table("user_analytics_summary").select("*").eq("id", user_id).execute()
            data = view_res.data
        except Exception as e:
            print(f"Warning: user_analytics_summary view not found: {e}")
            data = None
        
        if not data:
            # Fallback to direct user query if view doesn't exist or doesn't have data yet
            user_res = self.supabase.table("users").select("*").eq("id", user_id).execute()
            if not user_res.data:
                return None
            u = user_res.data[0]
            stats = UserStats(totalConversations=0, totalMessagesChat=0, nutritionAdherence=0)
        else:
            u = data[0]
            stats = UserStats(
                totalConversations=u.get("total_conversations", 0),
                totalMessagesChat=u.get("total_messages", 0),
                nutritionAdherence=82.3 # Mock or calculate
            )

        return UserDetailResponse(
            user=UserDetail(
                id=u["id"],
                email=u["email"],
                name=u.get("name") or u.get("full_name") or "Unknown",
                role=u["role"],
                status="active" if u.get("is_active", True) else "inactive",
                avatar=u.get("avatar_url"),
                createdAt=u["created_at"],
                lastLogin=u.get("last_login"),
                preferences={}, # From user_profiles if needed
                stats=stats
            )
        )

    def get_medical_profiles(
        self,
        limit: int = 20,
        offset: int = 0,
        pregnancy_status: Optional[str] = None,
        trimester: Optional[int] = None,
        search: Optional[str] = None
    ) -> MedicalProfileListResponse:
        try:
            # Bước 1: Lấy danh sách non-admin user IDs — loại bỏ role 'admin' khỏi bảng này
            # Chỉ cần 'id' vì frontend hiển thị ID (không hiển thị tên để bảo vệ quyền riêng tư)
            # Search vẫn dùng full_name/email để user có thể tìm kiếm, nhưng kết quả chỉ hiện ID
            user_query = (
                self.supabase.table("users")
                .select("id" + (", full_name, email" if search else ""))
                .neq("role", "admin")
            )
            if search:
                user_query = user_query.or_(
                    f"full_name.ilike.%{search}%,email.ilike.%{search}%"
                )

            user_res = user_query.limit(5000).execute()
            # Dùng set các IDs được phép (non-admin)
            user_map: dict = {u["id"]: u["id"] for u in (user_res.data or [])}

            if not user_map:
                return MedicalProfileListResponse(profiles=[], total=0, limit=limit, offset=offset)

            # Bước 2: Query medical_profiles, chỉ lấy profiles của non-admin users
            query = self.supabase.table("medical_profiles").select(
                "id, user_id, pregnancy_status, trimester, week_of_pregnancy, due_date, "
                "current_weight_kg, height_cm, bmi, blood_type, rh_factor, updated_at",
                count="exact"
            ).in_("user_id", list(user_map.keys()))

            if pregnancy_status and pregnancy_status != "all":
                query = query.eq("pregnancy_status", pregnancy_status)
            if trimester:
                query = query.eq("trimester", trimester)

            res = query.order("updated_at", desc=True).range(offset, offset + limit - 1).execute()

        except Exception as e:
            import traceback
            traceback.print_exc()
            return MedicalProfileListResponse(profiles=[], total=0, limit=limit, offset=offset)

        profiles = []
        for p in (res.data or []):
            user_id = p["user_id"]
            profiles.append(MedicalProfileSummary(
                id=p["id"],
                userId=user_id,
                userName=user_map.get(user_id, "Unknown"),
                pregnancyStatus=p["pregnancy_status"],
                trimester=p.get("trimester"),
                weekOfPregnancy=p.get("week_of_pregnancy"),
                dueDate=p.get("due_date"),
                prePregnancyWeight=None,
                currentWeight=p.get("current_weight_kg"),
                weightGain=None,
                heightCm=p.get("height_cm"),
                bmi=p.get("bmi"),
                bloodType=p.get("blood_type"),
                chronicDiseases=[],
                allergies=[],
                medicalHistory=None,
                lastCheckupDate=None,
                nextCheckupDate=None
            ))

        return MedicalProfileListResponse(
            profiles=profiles,
            total=res.count or 0,
            limit=limit,
            offset=offset
        )
