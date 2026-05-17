from supabase import Client, create_client

from app.core.config import settings

# Initialize Supabase client
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY
)

# Service role client for admin operations
supabase_admin: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY
) if settings.SUPABASE_SERVICE_KEY else None

def get_supabase() -> Client:
    # Dùng service key để bypass RLS trên server-side
    return supabase_admin if supabase_admin else supabase

def get_supabase_admin() -> Client:
    if not supabase_admin:
        raise Exception("Supabase service key not configured")
    return supabase_admin
