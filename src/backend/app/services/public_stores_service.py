"""
Public Stores Service — Tìm cửa hàng gần theo món ăn + vị trí user.
Dùng Haversine để lọc nhanh, Google Distance Matrix cho top kết quả.
"""
import math
import os
import httpx
from typing import Optional, List, Dict, Any


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Khoảng cách Haversine giữa 2 điểm (km)."""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class PublicStoresService:
    def __init__(self, supabase):
        self.supabase = supabase
        self.google_api_key = os.getenv("GOOGLEMAP_API_KEY", "")

    # ── 1. Tìm cửa hàng theo món ăn + vị trí ─────────────────────────────
    def search_nearby_stores(
        self,
        dish_name: str,
        user_lat: float,
        user_lng: float,
        radius_km: float = 10.0,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        1. Tìm dish_stt từ nutrition_database theo tên món
        2. Tìm stores có mapping với dish_stt đó
        3. Lọc theo Haversine radius
        4. Sắp xếp theo khoảng cách
        5. Gọi Google Distance Matrix cho top kết quả
        """
        # --- Bước 1: Tìm dish trong nutrition_database ---
        dish_res = self.supabase.table("nutrition_database").select(
            "stt, dish_name_vi, dish_name_en, price_vnd, image_url"
        ).ilike("dish_name_vi", f"%{dish_name}%").limit(10).execute()

        matched_dishes = dish_res.data or []
        if not matched_dishes:
            return {
                "stores": [],
                "matched_dishes": [],
                "total": 0,
                "query": dish_name,
                "user_location": {"lat": user_lat, "lng": user_lng},
            }

        dish_stts = [d["stt"] for d in matched_dishes]

        # --- Bước 2: Tìm store_food_mappings cho các dish ---
        mapping_res = (
            self.supabase.table("store_food_mappings")
            .select("store_id, dish_stt, price_at_store, availability, stores(id, name, address, city, district, ward, phone, website, latitude, longitude, operating_hours, status, food_items_count)")
            .in_("dish_stt", dish_stts)
            .eq("availability", True)
            .execute()
        )

        mappings = mapping_res.data or []

        # --- Bước 3: Gom theo store, lọc Haversine ---
        store_map: Dict[str, Dict] = {}
        for m in mappings:
            store_data = m.get("stores")
            if not store_data or store_data.get("status") != "active":
                continue
            lat = store_data.get("latitude")
            lng = store_data.get("longitude")
            if lat is None or lng is None:
                continue

            distance = haversine_km(user_lat, user_lng, float(lat), float(lng))
            if distance > radius_km:
                continue

            sid = store_data["id"]
            if sid not in store_map:
                store_map[sid] = {
                    "id": sid,
                    "name": store_data["name"],
                    "address": store_data.get("address", ""),
                    "city": store_data.get("city", ""),
                    "district": store_data.get("district", ""),
                    "ward": store_data.get("ward", ""),
                    "phone": store_data.get("phone"),
                    "website": store_data.get("website"),
                    "latitude": float(lat),
                    "longitude": float(lng),
                    "operating_hours": store_data.get("operating_hours"),
                    "food_items_count": store_data.get("food_items_count", 0),
                    "distance_km": round(distance, 2),
                    "available_dishes": [],
                    "travel_info": None,
                }

            # Thêm thông tin món ăn
            dish_info = next(
                (d for d in matched_dishes if d["stt"] == m["dish_stt"]), None
            )
            if dish_info:
                store_map[sid]["available_dishes"].append({
                    "stt": m["dish_stt"],
                    "name": dish_info["dish_name_vi"],
                    "price_db": dish_info.get("price_vnd"),
                    "price_at_store": m.get("price_at_store"),
                    "image_url": dish_info.get("image_url"),
                })

        # --- Bước 4: Sắp xếp theo khoảng cách ---
        stores_list = sorted(store_map.values(), key=lambda s: s["distance_km"])
        stores_list = stores_list[:limit]

        # --- Bước 5: Google Distance Matrix cho top 5 ---
        if self.google_api_key and stores_list:
            top_stores = stores_list[:5]
            self._enrich_with_google_distance(user_lat, user_lng, top_stores)

        return {
            "stores": stores_list,
            "matched_dishes": [
                {"stt": d["stt"], "name": d["dish_name_vi"], "price_vnd": d.get("price_vnd")}
                for d in matched_dishes
            ],
            "total": len(stores_list),
            "query": dish_name,
            "user_location": {"lat": user_lat, "lng": user_lng},
        }

    # ── 2. Lấy tất cả cửa hàng gần vị trí (không cần dish) ──────────────
    def get_nearby_stores(
        self,
        user_lat: float,
        user_lng: float,
        radius_km: float = 10.0,
        limit: int = 20,
    ) -> Dict[str, Any]:
        res = (
            self.supabase.table("stores")
            .select("id, name, address, city, district, ward, phone, website, latitude, longitude, operating_hours, status, food_items_count")
            .eq("status", "active")
            .execute()
        )

        stores = []
        for s in (res.data or []):
            lat = s.get("latitude")
            lng = s.get("longitude")
            if lat is None or lng is None:
                continue
            distance = haversine_km(user_lat, user_lng, float(lat), float(lng))
            if distance > radius_km:
                continue
            stores.append({
                **s,
                "latitude": float(lat),
                "longitude": float(lng),
                "distance_km": round(distance, 2),
                "travel_info": None,
            })

        stores.sort(key=lambda x: x["distance_km"])
        stores = stores[:limit]

        # Enrich top 5 with Google Distance
        if self.google_api_key and stores:
            self._enrich_with_google_distance(user_lat, user_lng, stores[:5])

        return {
            "stores": stores,
            "total": len(stores),
            "user_location": {"lat": user_lat, "lng": user_lng},
        }

    # ── 3. Lấy chi tiết cửa hàng + danh sách món có sẵn ────────────────
    def get_store_detail(self, store_id: str) -> Optional[Dict[str, Any]]:
        store_res = (
            self.supabase.table("stores")
            .select("*")
            .eq("id", store_id)
            .single()
            .execute()
        )
        if not store_res.data:
            return None

        # Lấy danh sách món ăn có sẵn tại cửa hàng
        food_res = (
            self.supabase.table("store_food_mappings")
            .select("dish_stt, price_at_store, availability, nutrition_database(stt, dish_name_vi, dish_name_en, price_vnd, image_url, energy, protein, fat, carbohydrate)")
            .eq("store_id", store_id)
            .eq("availability", True)
            .execute()
        )

        foods = []
        for f in (food_res.data or []):
            dish = f.get("nutrition_database", {})
            foods.append({
                "stt": f["dish_stt"],
                "name": dish.get("dish_name_vi", ""),
                "name_en": dish.get("dish_name_en", ""),
                "price_db": dish.get("price_vnd"),
                "price_at_store": f.get("price_at_store"),
                "image_url": dish.get("image_url"),
                "energy": dish.get("energy", 0),
                "protein": dish.get("protein", 0),
                "fat": dish.get("fat", 0),
                "carbohydrate": dish.get("carbohydrate", 0),
            })

        return {
            "store": store_res.data,
            "foods": foods,
            "food_count": len(foods),
        }

    # ── Private: Google Distance Matrix ──────────────────────────────────
    def _enrich_with_google_distance(
        self,
        origin_lat: float,
        origin_lng: float,
        stores: List[Dict],
    ):
        """Gọi Google Distance Matrix API để lấy thời gian + khoảng cách thực tế."""
        if not stores:
            return

        destinations = "|".join(
            f"{s['latitude']},{s['longitude']}" for s in stores
        )
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
            "origins": f"{origin_lat},{origin_lng}",
            "destinations": destinations,
            "mode": "driving",
            "language": "vi",
            "key": self.google_api_key,
        }

        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(url, params=params)
                data = resp.json()

            if data.get("status") == "OK":
                elements = data["rows"][0]["elements"]
                for i, elem in enumerate(elements):
                    if i < len(stores) and elem.get("status") == "OK":
                        stores[i]["travel_info"] = {
                            "distance_text": elem["distance"]["text"],
                            "distance_value": elem["distance"]["value"],
                            "duration_text": elem["duration"]["text"],
                            "duration_value": elem["duration"]["value"],
                        }
        except Exception as e:
            # Không crash nếu Google API lỗi — giữ Haversine distance
            print(f"[Google Distance Matrix] Error: {e}")
