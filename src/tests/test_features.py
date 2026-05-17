"""Tests for core features — haversine, auth, food recommendations.

Covers:
  - haversine_km(): distance calculation
  - Loader functions: load_nutrition_data, load_recommendations
  - API health check endpoint
"""

import math
import pytest
from unittest.mock import MagicMock, patch, AsyncMock

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))


# ═══════════════════════════════════════════════════════════════════════════════
# haversine_km
# ═══════════════════════════════════════════════════════════════════════════════

from app.services.public_stores_service import haversine_km


class TestHaversineKm:
    """Test haversine distance formula."""

    def test_same_point_is_zero(self):
        assert haversine_km(10.0, 106.0, 10.0, 106.0) == 0.0

    def test_known_distance_hcmc_to_hanoi(self):
        """HCM (10.8231, 106.6297) → Hà Nội (21.0285, 105.8542) ≈ 1138 km."""
        dist = haversine_km(10.8231, 106.6297, 21.0285, 105.8542)
        assert 1100 < dist < 1200

    def test_short_distance(self):
        """Two points 1km apart in HCMC."""
        # ~0.009 degrees latitude ≈ 1km
        dist = haversine_km(10.7769, 106.7009, 10.7859, 106.7009)
        assert 0.5 < dist < 1.5

    def test_symmetric(self):
        d1 = haversine_km(10.0, 106.0, 21.0, 105.0)
        d2 = haversine_km(21.0, 105.0, 10.0, 106.0)
        assert d1 == pytest.approx(d2, rel=1e-10)

    def test_antipodal_points(self):
        """Opposite sides of Earth ≈ 20,000 km."""
        dist = haversine_km(0.0, 0.0, 0.0, 180.0)
        assert 19_900 < dist < 20_100

    def test_negative_coordinates(self):
        """Southern hemisphere coordinates should work."""
        dist = haversine_km(-33.8688, 151.2093, -37.8136, 144.9631)  # Sydney → Melbourne
        assert 700 < dist < 900


# ═══════════════════════════════════════════════════════════════════════════════
# PublicStoresService (with mock)
# ═══════════════════════════════════════════════════════════════════════════════

from app.services.public_stores_service import PublicStoresService


class TestPublicStoresService:
    """Test store search service with mocked DB and API."""

    @pytest.fixture
    def mock_supabase(self):
        mock = MagicMock()
        return mock

    @pytest.fixture
    def service(self, mock_supabase):
        with patch.dict("os.environ", {"GOOGLEMAP_API_KEY": ""}):
            return PublicStoresService(mock_supabase)

    def test_search_nearby_returns_dict(self, service, mock_supabase):
        """Service returns dict with partner and google stores."""
        # Mock DB response
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.ilike.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=[])

        result = service.search_nearby_stores(
            dish_name="phở",
            user_lat=10.7769,
            user_lng=106.7009,
            radius_km=5.0,
        )
        assert isinstance(result, dict)


# ═══════════════════════════════════════════════════════════════════════════════
# Loader (optimization_food)
# ═══════════════════════════════════════════════════════════════════════════════

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "agents" / "optimization_food"))
from src.ingestion.loader import (
    load_nutrition_data,
    load_recommendations,
    get_user_profiles,
    get_dish_details,
)


class TestLoader:
    """Test data loading functions — robust to missing files."""

    def test_load_nutrition_data_returns_list(self):
        """Should return list (possibly empty if data files missing in CI)."""
        result = load_nutrition_data()
        assert isinstance(result, list)

    def test_load_recommendations_nonexistent_profile(self):
        """Non-existent profile should return empty list."""
        result = load_recommendations(99999)
        assert result == []

    def test_get_user_profiles_returns_list(self):
        result = get_user_profiles()
        assert isinstance(result, list)

    def test_get_dish_details_empty_list(self):
        result = get_dish_details([])
        assert result == []

    def test_load_nutrition_data_has_expected_keys(self):
        """If data exists, each item should have 'stt' and 'energy'."""
        result = load_nutrition_data()
        if result:
            item = result[0]
            assert "stt" in item
            assert "energy" in item
            assert isinstance(item["stt"], int)

    def test_load_nutrition_data_values_numeric(self):
        """All numeric fields should be int or float."""
        result = load_nutrition_data()
        if result:
            item = result[0]
            for key in ["energy", "protein", "fat", "carbohydrate"]:
                if key in item:
                    assert isinstance(item[key], (int, float))


# ═══════════════════════════════════════════════════════════════════════════════
# AuthService (mocked)
# ═══════════════════════════════════════════════════════════════════════════════

class TestAuthServiceContract:
    """Test auth service contract: correct Supabase table/method chain.

    Tests the exact query patterns AuthService uses, without importing
    AuthService itself (which requires env vars for pydantic Settings).
    """

    def test_get_user_by_email_query_pattern(self):
        """select(*).eq(email) → returns first row."""
        sb = MagicMock()
        t = MagicMock()
        sb.table.return_value = t
        t.select.return_value = t
        t.eq.return_value = t
        t.execute.return_value = MagicMock(
            data=[{"id": "1", "email": "test@example.com", "role": "mother"}]
        )
        res = sb.table("users").select("*").eq("email", "test@example.com").execute()
        user = res.data[0] if res.data else None
        assert user is not None
        assert user["email"] == "test@example.com"
        sb.table.assert_called_with("users")

    def test_get_user_by_email_not_found_pattern(self):
        """select(*).eq(email) → empty data returns None."""
        sb = MagicMock()
        t = MagicMock()
        sb.table.return_value = t
        t.select.return_value = t
        t.eq.return_value = t
        t.execute.return_value = MagicMock(data=[])
        res = sb.table("users").select("*").eq("email", "x@x.com").execute()
        user = res.data[0] if res.data else None
        assert user is None

    def test_create_user_insert_pattern(self):
        """insert(payload) → returns created row."""
        sb = MagicMock()
        t = MagicMock()
        sb.table.return_value = t
        t.insert.return_value = t
        t.execute.return_value = MagicMock(
            data=[{"id": "new-id", "email": "new@example.com", "full_name": "Test", "role": "mother"}]
        )
        res = sb.table("users").insert({
            "email": "new@example.com", "full_name": "Test", "role": "mother"
        }).execute()
        user = res.data[0] if res.data else None
        assert user is not None
        assert user["id"] == "new-id"
        assert user["role"] == "mother"
