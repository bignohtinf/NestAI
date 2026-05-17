from app.core.supabase_client import get_supabase


class AuthService:
    @staticmethod
    async def get_user_by_email(email: str):
        supabase = get_supabase()
        result = supabase.table("users").select("*").eq("email", email).execute()
        return result.data[0] if result.data else None
    
    @staticmethod
    async def create_user(email: str, full_name: str, role: str):
        supabase = get_supabase()
        result = supabase.table("users").insert({
            "email": email,
            "full_name": full_name,
            "role": role
        }).execute()
        return result.data[0] if result.data else None
