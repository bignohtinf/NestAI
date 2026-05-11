from typing import Any, Optional, List, Dict
from app.schemas.admin_system import (
    CMSItemCreate,
    CMSItemUpdate,
    CMSItemSummary,
    CMSItemListResponse,
    AuditLogSummary,
    AuditLogListResponse
)

class AdminSystemService:
    def __init__(self, supabase):
        self.supabase = supabase

    def get_cms_items(
        self,
        limit: int = 20,
        offset: int = 0,
        type: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> CMSItemListResponse:
        try:
            # Fixed: Specify FK name to avoid ambiguous relationship error
            # cms_items has two FKs to users (created_by, updated_by), so we need to specify which one
            query = self.supabase.table("cms_items").select("*, users!cms_items_created_by_fkey(email)", count="exact")
            
            if type:
                query = query.eq("type", type)
            if status:
                query = query.eq("status", status)
            if search:
                query = query.or_(f"title.ilike.%{search}%,content.ilike.%{search}%")
                
            res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            items = []
            for i in (res.data or []):
                item_dict = i.copy()
                item_dict["authorEmail"] = i.get("users", {}).get("email")
                items.append(CMSItemSummary(**item_dict))
                
            return CMSItemListResponse(
                items=items,
                total=res.count or 0,
                limit=limit,
                offset=offset
            )
        except Exception as e:
            print(f"Warning: cms_items table not found: {e}")
            return CMSItemListResponse(items=[], total=0, limit=limit, offset=offset)

    def create_cms_item(self, item_data: CMSItemCreate, admin_id: str) -> dict:
        data = item_data.model_dump(by_alias=True)
        data["created_by"] = admin_id
        res = self.supabase.table("cms_items").insert(data).execute()
        return res.data[0] if res.data else None

    def update_cms_item(self, item_id: str, updates: CMSItemUpdate) -> dict:
        data = updates.model_dump(by_alias=True, exclude_unset=True)
        res = self.supabase.table("cms_items").update(data).eq("id", item_id).execute()
        return res.data[0] if res.data else None

    def delete_cms_item(self, item_id: str) -> bool:
        self.supabase.table("cms_items").delete().eq("id", item_id).execute()
        return True

    def get_system_settings(self) -> Dict[str, Any]:
        try:
            res = self.supabase.table("system_settings").select("key, value").execute()
            return {item["key"]: item["value"] for item in (res.data or [])}
        except Exception as e:
            print(f"Warning: system_settings table not found: {e}")
            return {}

    def update_system_settings(self, settings: Dict[str, Any], admin_id: str) -> bool:
        for key, value in settings.items():
            self.supabase.table("system_settings").upsert({
                "key": key,
                "value": value,
                "updated_by": admin_id
            }, on_conflict="key").execute()
        return True

    def get_audit_logs(
        self,
        limit: int = 20,
        offset: int = 0,
        action: Optional[str] = None,
        admin_id: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> AuditLogListResponse:
        try:
            # Use existing admin_logs table (augmented in Migration 017)
            # Fixed: Specify FK name - admin_logs has FK to users via admin_id
            query = self.supabase.table("admin_logs").select("*, users!admin_logs_admin_id_fkey(email)", count="exact")
            
            if action:
                query = query.eq("action", action)
            if admin_id:
                query = query.eq("admin_id", admin_id)
            if date_from:
                query = query.gte("created_at", date_from)
            if date_to:
                query = query.lte("created_at", date_to)
                
            res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
            
            logs = []
            for l in (res.data or []):
                log_dict = l.copy()
                log_dict["adminEmail"] = l.get("users", {}).get("email")
                logs.append(AuditLogSummary(**log_dict))
                
            return AuditLogListResponse(
                logs=logs,
                total=res.count or 0,
                limit=limit,
                offset=offset
            )
        except Exception as e:
            print(f"Warning: admin_logs table not found: {e}")
            return AuditLogListResponse(logs=[], total=0, limit=limit, offset=offset)
