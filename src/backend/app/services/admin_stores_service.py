from typing import Optional, List
from app.schemas.admin_stores import (
    StoreCreate,
    StoreUpdate,
    StoreListResponse,
    StoreFoodMappingCreate,
    StoreFoodMappingListResponse,
    StoreLocationsResponse,
    StoreSummary,
    StoreFoodMappingSummary,
    StoreLocation
)

class AdminStoresService:
    def __init__(self, supabase):
        self.supabase = supabase

    def get_stores_list(
        self,
        limit: int = 20,
        offset: int = 0,
        city: Optional[str] = None,
        district: Optional[str] = None,
        search: Optional[str] = None,
        status: Optional[str] = None
    ) -> StoreListResponse:
        query = self.supabase.table("stores").select("*", count="exact")
        
        if city:
            query = query.eq("city", city)
        if district:
            query = query.eq("district", district)
        if status:
            query = query.eq("status", status)
        if search:
            query = query.ilike("name", f"%{search}%")
            
        res = query.order("name").range(offset, offset + limit - 1).execute()
        
        return StoreListResponse(
            stores=res.data or [],
            total=res.count or 0,
            limit=limit,
            offset=offset
        )

    def create_store(self, store_data: StoreCreate) -> dict:
        data = store_data.model_dump(by_alias=True)
        res = self.supabase.table("stores").insert(data).execute()
        return res.data[0] if res.data else None

    def update_store(self, store_id: str, store_data: StoreUpdate) -> dict:
        data = store_data.model_dump(by_alias=True, exclude_unset=True)
        res = self.supabase.table("stores").update(data).eq("id", store_id).execute()
        return res.data[0] if res.data else None

    def delete_store(self, store_id: str) -> bool:
        self.supabase.table("stores").delete().eq("id", store_id).execute()
        return True

    def get_mappings_list(
        self,
        limit: int = 20,
        offset: int = 0,
        store_id: Optional[str] = None,
        dish_stt: Optional[int] = None,
        search: Optional[str] = None
    ) -> StoreFoodMappingListResponse:
        # Join with stores and nutrition_database for names
        query = self.supabase.table("store_food_mappings").select(
            "*, stores(name), nutrition_database(dish_name_vi)",
            count="exact"
        )
        
        if store_id:
            query = query.eq("store_id", store_id)
        if dish_stt:
            query = query.eq("dish_stt", dish_stt)
        
        # Search is tricky with joins in Supabase/PostgREST direct query
        # Usually requires a view or specialized RPC for deep filters
        # For now, search in notes if provided
        if search:
            query = query.ilike("notes", f"%{search}%")
            
        res = query.order("updated_at", desc=True).range(offset, offset + limit - 1).execute()
        
        mappings = []
        for m in (res.data or []):
            mappings.append(StoreFoodMappingSummary(
                id=m["id"],
                store_id=m["store_id"],
                dish_stt=m["dish_stt"],
                availability=m["availability"],
                price_at_store=m["price_at_store"],
                notes=m["notes"],
                store_name=m["stores"]["name"] if m.get("stores") else None,
                dish_name=m["nutrition_database"]["dish_name_vi"] if m.get("nutrition_database") else None,
                updated_at=m["updated_at"]
            ))
            
        return StoreFoodMappingListResponse(
            mappings=mappings,
            total=res.count or 0,
            limit=limit,
            offset=offset
        )

    def add_mapping(self, mapping_data: StoreFoodMappingCreate) -> dict:
        data = mapping_data.model_dump(by_alias=True)
        res = self.supabase.table("store_food_mappings").upsert(data, on_conflict="store_id,dish_stt").execute()
        return res.data[0] if res.data else None

    def delete_mapping(self, mapping_id: str) -> bool:
        self.supabase.table("store_food_mappings").delete().eq("id", mapping_id).execute()
        return True

    def get_store_locations(self, city: Optional[str] = None) -> StoreLocationsResponse:
        query = self.supabase.table("stores").select("id, name, latitude, longitude, address, food_items_count").eq("status", "active")
        if city:
            query = query.eq("city", city)
            
        res = query.execute()
        stores = res.data or []
        
        # Calculate a rough center
        if stores:
            lats = [s["latitude"] for s in stores if s["latitude"]]
            lngs = [s["longitude"] for s in stores if s["longitude"]]
            center = {
                "latitude": sum(lats) / len(lats) if lats else 21.0285,
                "longitude": sum(lngs) / len(lngs) if lngs else 105.8542
            }
        else:
            center = {"latitude": 21.0285, "longitude": 105.8542} # Hanoi default

        return StoreLocationsResponse(
            stores=[StoreLocation(**s) for s in stores],
            center=center
        )
