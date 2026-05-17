"""
Public Store endpoints — cho user (không cần admin).
- Tìm cửa hàng gần theo món ăn
- Lấy danh sách cửa hàng gần vị trí
- Xem chi tiết cửa hàng + món có sẵn
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.supabase_client import get_supabase
from app.services.public_stores_service import PublicStoresService

router = APIRouter()


@router.get("/nearby")
async def search_nearby_stores(
    dish: Optional[str] = Query(None, description="Tên món ăn cần tìm"),
    lat: float = Query(..., description="Vĩ độ user"),
    lng: float = Query(..., description="Kinh độ user"),
    radius: float = Query(10.0, ge=0.5, le=50.0, description="Bán kính tìm kiếm (km)"),
    limit: int = Query(20, ge=1, le=50),
    supabase=Depends(get_supabase),
):
    """
    Tìm cửa hàng gần vị trí user.
    Nếu có `dish` → lọc cửa hàng có bán món đó.
    Nếu không có `dish` → trả tất cả cửa hàng gần.
    """
    service = PublicStoresService(supabase)

    if dish:
        return service.search_nearby_stores(
            dish_name=dish,
            user_lat=lat,
            user_lng=lng,
            radius_km=radius,
            limit=limit,
        )
    else:
        return service.get_nearby_stores(
            user_lat=lat,
            user_lng=lng,
            radius_km=radius,
            limit=limit,
        )


@router.get("/{store_id}")
async def get_store_detail(
    store_id: str,
    supabase=Depends(get_supabase),
):
    """Xem chi tiết cửa hàng + danh sách món ăn có sẵn."""
    service = PublicStoresService(supabase)
    result = service.get_store_detail(store_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy cửa hàng")
    return result
