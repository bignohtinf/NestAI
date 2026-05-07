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
        print(f"[DEBUG] get_users_list called - role: {role}, status: {status}, search: {search}")
        
        # Start with a clean query to see if ANY users exist
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
            print(f"[DEBUG] Supabase result - count: {res.count}, data_len: {len(res.data or [])}")
        except Exception as e:
            print(f"[ERROR] Supabase query failed: {str(e)}")
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
            except Exception as map_err:
                print(f"[ERROR] Mapping user {u.get('id')} failed: {str(map_err)}")
            
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
        # Query medical profiles with user data
        print(f"[DEBUG] get_medical_profiles called - pregnancy: {pregnancy_status}, trimester: {trimester}")

        try:
            # Use admin client to bypass RLS (service key required)
            # Note: If supabase doesn't have service key, this will fall back to anon client
            admin_client = self.supabase

            # Try to access supabase_admin if available (imported in calling route)
            # For now, we'll use the current client and handle RLS gracefully

            # Try with explicit fkey join first (required if multiple relations exist)
            try:
                query = admin_client.table("medical_profiles").select(
                    "id, user_id, pregnancy_status, trimester, week_of_pregnancy, due_date, "
                    "pre_pregnancy_weight_kg, current_weight_kg, weight_gain_kg, height_cm, bmi, "
                    "blood_type, rh_factor, chronic_diseases, allergies, medical_history, last_checkup_date, "
                    "next_checkup_date, updated_at, users!medical_profiles_user_id_fkey(id, full_name, email)",
                    count="exact"
                )
                print(f"[DEBUG] Querying medical_profiles with explicit fkey join")
            except Exception as join_err:
                print(f"[WARNING] Explicit join failed, trying implicit: {join_err}")
                query = admin_client.table("medical_profiles").select(
                    "id, user_id, pregnancy_status, trimester, week_of_pregnancy, due_date, "
                    "pre_pregnancy_weight_kg, current_weight_kg, weight_gain_kg, height_cm, bmi, "
                    "blood_type, rh_factor, chronic_diseases, allergies, medical_history, last_checkup_date, "
                    "next_checkup_date, updated_at, users(id, full_name, email)",
                    count="exact"
                )

            # Only apply pregnancy_status filter if it's specified and not "all"
            if pregnancy_status and pregnancy_status != "all":
                print(f"[DEBUG] Applying filter: pregnancy_status = '{pregnancy_status}'")
                query = query.eq("pregnancy_status", pregnancy_status)

            # Only apply trimester filter if it's specified
            if trimester:
                print(f"[DEBUG] Applying filter: trimester = {trimester}")
                query = query.eq("trimester", trimester)

            # Apply search filter if provided
            if search:
                print(f"[DEBUG] Applying search filter: '{search}'")
                # Supabase doesn't support searching in joined fields
                # We'll fetch and filter in Python if needed

            # Execute query
            print(f"[DEBUG] Executing query with limit={limit}, offset={offset}")
            res = query.order("updated_at", desc=True).range(offset, offset + limit - 1).execute()

            print(f"[DEBUG] Supabase query result - count: {res.count}, data_len: {len(res.data or [])}")

            if res.data and len(res.data) > 0:
                print(f"[DEBUG] Sample record: ID={res.data[0].get('id')}, User={res.data[0].get('user_id')}, Status={res.data[0].get('pregnancy_status')}")
            else:
                print(f"[DEBUG] No medical_profiles records found (or RLS blocked access)")

        except Exception as e:
            print(f"[ERROR] get_medical_profiles query failed: {type(e).__name__}: {str(e)}")
            import traceback
            print("[ERROR] Full traceback:")
            traceback.print_exc()
            return MedicalProfileListResponse(profiles=[], total=0, limit=limit, offset=offset)

        profiles = []
        for p in (res.data or []):
            # Handle both view response and direct query response
            user_name = p.get("user_name") or (p.get("users", {}).get("full_name") if isinstance(p.get("users"), dict) else "Unknown")

            profiles.append(MedicalProfileSummary(
                id=p["id"],
                userId=p["user_id"],
                userName=user_name,
                pregnancyStatus=p["pregnancy_status"],
                trimester=p.get("trimester"),
                weekOfPregnancy=p.get("week_of_pregnancy"),
                dueDate=p.get("due_date"),
                prePregnancyWeight=p.get("pre_pregnancy_weight_kg"),
                currentWeight=p.get("current_weight_kg"),
                weightGain=p.get("weight_gain_kg"),
                heightCm=p.get("height_cm"),
                bmi=p.get("bmi"),
                bloodType=p.get("blood_type"),
                chronicDiseases=p.get("chronic_diseases") or [],
                allergies=p.get("allergies") or [],
                medicalHistory=p.get("medical_history"),
                lastCheckupDate=p.get("last_checkup_date"),
                nextCheckupDate=p.get("next_checkup_date")
            ))
            
        return MedicalProfileListResponse(
            profiles=profiles,
            total=res.count or 0,
            limit=limit,
            offset=offset
        )
