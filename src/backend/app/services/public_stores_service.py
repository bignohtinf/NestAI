"""
Public Stores Service — Tìm cửa hàng gần theo món ăn + vị trí user.
Hybrid: ưu tiên cửa hàng liên kết (DB) + bổ sung từ Google Places API.
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

    # ── 1. Tìm cửa hàng theo món ăn + vị trí (HYBRID) ───────────────────
    def search_nearby_stores(
        self,
        dish_name: str,
        user_lat: float,
        user_lng: float,
        radius_km: float = 10.0,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Hybrid search:
        1. Tìm trong DB (cửa hàng liên kết) → ưu tiên hiển thị trước
        2. Bổ sung từ Google Places Text Search → hiển thị sau
        """
        # --- Phần A: Tìm từ DB (cửa hàng liên kết) ---
        partner_stores = self._search_partner_stores(dish_name, user_lat, user_lng, radius_km, limit)

        # --- Phần B: Tìm từ Google Places API ---
        google_stores = []
        if self.google_api_key:
            remaining = limit - len(partner_stores)
            if remaining > 0:
                google_stores = self._search_google_places(
                    dish_name, user_lat, user_lng, radius_km, remaining, partner_stores
                )

        # --- Kết hợp kết quả ---
        # Đánh dấu nguồn
        for s in partner_stores:
            s["source"] = "partner"
            s["is_partner"] = True
        for s in google_stores:
            s["source"] = "google"
            s["is_partner"] = False

        all_stores = partner_stores + google_stores

        # Tìm matched dishes cho response
        dish_res = self.supabase.table("nutrition_database").select(
            "stt, dish_name_vi, price_vnd"
        ).ilike("dish_name_vi", f"%{dish_name}%").limit(10).execute()
        matched_dishes = [
            {"stt": d["stt"], "name": d["dish_name_vi"], "price_vnd": d.get("price_vnd")}
            for d in (dish_res.data or [])
        ]

        return {
            "stores": all_stores,
            "matched_dishes": matched_dishes,
            "total": len(all_stores),
            "partner_count": len(partner_stores),
            "google_count": len(google_stores),
            "query": dish_name,
            "user_location": {"lat": user_lat, "lng": user_lng},
        }

    # ── 1A. Tìm trong DB (cửa hàng liên kết / đối tác) ──────────────────
    def _search_partner_stores(
        self,
        dish_name: str,
        user_lat: float,
        user_lng: float,
        radius_km: float,
        limit: int,
    ) -> List[Dict[str, Any]]:
        """Tìm cửa hàng đối tác trong DB theo tên món."""
        # Tìm dish trong nutrition_database
        dish_res = self.supabase.table("nutrition_database").select(
            "stt, dish_name_vi, dish_name_en, price_vnd, image_url"
        ).ilike("dish_name_vi", f"%{dish_name}%").limit(10).execute()

        matched_dishes = dish_res.data or []
        if not matched_dishes:
            return []

        dish_stts = [d["stt"] for d in matched_dishes]

        # Tìm store_food_mappings
        mapping_res = (
            self.supabase.table("store_food_mappings")
            .select("store_id, dish_stt, price_at_store, availability, stores(id, name, address, city, district, ward, phone, website, latitude, longitude, operating_hours, status, food_items_count)")
            .in_("dish_stt", dish_stts)
            .eq("availability", True)
            .execute()
        )

        mappings = mapping_res.data or []

        # Gom theo store, lọc Haversine
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

        # Sắp xếp theo khoảng cách
        stores_list = sorted(store_map.values(), key=lambda s: s["distance_km"])
        stores_list = stores_list[:limit]

        # Google Distance Matrix cho top 5
        if self.google_api_key and stores_list:
            self._enrich_with_google_distance(user_lat, user_lng, stores_list[:5])

        return stores_list

    # ── 1B. Tìm từ Google Places API ─────────────────────────────────────
    def _search_google_places(
        self,
        dish_name: str,
        user_lat: float,
        user_lng: float,
        radius_km: float,
        limit: int,
        partner_stores: List[Dict],
    ) -> List[Dict[str, Any]]:
        """
        Gọi Google Places Text Search (New) để tìm quán ăn/cửa hàng bán món.
        Loại bỏ kết quả trùng với partner stores.
        """
        try:
            # Dùng Places API (New) - Text Search
            url = "https://places.googleapis.com/v1/places:searchText"
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.google_api_key,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.photos,places.priceLevel,places.types",
            }
            body = {
                "textQuery": f"{dish_name} quán ăn nhà hàng",
                "locationBias": {
                    "circle": {
                        "center": {"latitude": user_lat, "longitude": user_lng},
                        "radius": radius_km * 1000,  # Convert to meters
                    }
                },
                "maxResultCount": min(limit, 20),
                "languageCode": "vi",
            }

            with httpx.Client(timeout=15) as client:
                resp = client.post(url, json=body, headers=headers)
                data = resp.json()

            places = data.get("places", [])
            if not places:
                return []

            # Tập hợp tọa độ partner stores để loại trùng
            partner_coords = set()
            for ps in partner_stores:
                # Round to 4 decimal places (~11m) cho so sánh
                partner_coords.add((
                    round(ps["latitude"], 4),
                    round(ps["longitude"], 4),
                ))

            google_stores = []
            for place in places:
                loc = place.get("location", {})
                p_lat = loc.get("latitude")
                p_lng = loc.get("longitude")
                if p_lat is None or p_lng is None:
                    continue

                # Kiểm tra trùng với partner store
                coord_key = (round(p_lat, 4), round(p_lng, 4))
                if coord_key in partner_coords:
                    continue

                distance = haversine_km(user_lat, user_lng, p_lat, p_lng)

                # Lấy tên hiển thị
                display_name = place.get("displayName", {})
                name = display_name.get("text", "Unknown") if isinstance(display_name, dict) else str(display_name)

                # Lấy giờ mở cửa
                opening_hours = place.get("currentOpeningHours", {})
                is_open = opening_hours.get("openNow")

                # Lấy photo reference (chỉ lấy cái đầu tiên)
                photos = place.get("photos", [])
                photo_url = None
                if photos:
                    photo_name = photos[0].get("name", "")
                    if photo_name:
                        photo_url = f"https://places.googleapis.com/v1/{photo_name}/media?maxHeightPx=200&maxWidthPx=300&key={self.google_api_key}"

                google_stores.append({
                    "id": f"google_{place.get('id', '')}",
                    "google_place_id": place.get("id"),
                    "name": name,
                    "address": place.get("formattedAddress", ""),
                    "city": "",
                    "district": "",
                    "ward": "",
                    "phone": place.get("nationalPhoneNumber"),
                    "website": place.get("websiteUri"),
                    "latitude": p_lat,
                    "longitude": p_lng,
                    "distance_km": round(distance, 2),
                    "rating": place.get("rating"),
                    "user_ratings_total": place.get("userRatingCount"),
                    "is_open_now": is_open,
                    "photo_url": photo_url,
                    "price_level": place.get("priceLevel"),
                    "types": place.get("types", []),
                    "travel_info": None,
                    "available_dishes": [],
                })

            # Sắp xếp theo khoảng cách
            google_stores.sort(key=lambda s: s["distance_km"])

            # Enrich top 5 with Distance Matrix
            if google_stores:
                self._enrich_with_google_distance(user_lat, user_lng, google_stores[:5])

            return google_stores[:limit]

        except Exception as e:
            print(f"[Google Places API] Error: {e}")
            return []

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
                "source": "partner",
                "is_partner": True,
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
        """Lấy chi tiết store từ DB. Cho Google Places store, trả None."""
        if store_id.startswith("google_"):
            return None

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
            print(f"[Google Distance Matrix] Error: {e}")
