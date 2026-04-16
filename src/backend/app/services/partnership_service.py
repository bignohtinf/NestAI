from app.core.supabase_client import get_supabase

class PartnershipService:
    @staticmethod
    async def create_partnership_request(mother_id: str, partner_email: str):
        supabase = get_supabase()
        
        # Find partner
        partner_result = supabase.table("users").select("id").eq("email", partner_email).execute()
        if not partner_result.data:
            return None
        
        partner_id = partner_result.data[0]["id"]
        
        # Create partnership
        result = supabase.table("partnerships").insert({
            "mother_id": mother_id,
            "father_id": partner_id,
            "status": "pending"
        }).execute()
        
        return result.data[0] if result.data else None
    
    @staticmethod
    async def respond_partnership(partnership_id: str, status: str):
        supabase = get_supabase()
        result = supabase.table("partnerships").update({
            "status": status
        }).eq("id", partnership_id).execute()
        
        return result.data[0] if result.data else None
