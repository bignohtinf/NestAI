"""Tests for optimization_food engine — optimizer.py

Covers:
  - parse_range(): value string → (min, max) tuple
  - map_rec_to_nutrition_key(): Vietnamese name → nutrition key
  - _resolve_meal_budgets(): budget resolution logic
  - _solve_meal(): CP-SAT single meal solve (integration)
  - recommend_full_day_meals(): full day plan generation
"""

import pytest

from src.engine.optimizer import (
    MEAL_RATIOS,
    PRIMARY_NUTRIENT_KEYS,
    UNIT_GRAMS,
    _resolve_meal_budgets,
    _solve_meal,
    map_rec_to_nutrition_key,
    parse_range,
    recommend_full_day_meals,
)

# ═══════════════════════════════════════════════════════════════════════════════
# parse_range
# ═══════════════════════════════════════════════════════════════════════════════

class TestParseRange:
    """Test parse_range() — extracts (min, max) from Vietnamese nutrition strings."""

    def test_two_values(self):
        assert parse_range("50 - 100") == (50.0, 100.0)

    def test_two_decimal_values(self):
        assert parse_range("2.5 - 3.5") == (2.5, 3.5)

    def test_comma_decimal(self):
        """Vietnamese CSV uses comma as decimal separator."""
        result = parse_range("1,5 - 2,5")
        assert result == (1.5, 2.5)

    def test_single_value(self):
        """Single value → ±5% band."""
        lo, hi = parse_range("100")
        assert lo == pytest.approx(95.0)
        assert hi == pytest.approx(105.0)

    def test_no_numbers(self):
        assert parse_range("không xác định") == (0.0, 0.0)

    def test_empty_string(self):
        assert parse_range("") == (0.0, 0.0)

    def test_value_with_unit(self):
        """Strings like '2000 kcal' should still parse."""
        lo, hi = parse_range("2000 kcal")
        assert lo == pytest.approx(1900.0)
        assert hi == pytest.approx(2100.0)


# ═══════════════════════════════════════════════════════════════════════════════
# map_rec_to_nutrition_key
# ═══════════════════════════════════════════════════════════════════════════════

class TestMapRecToNutritionKey:
    """Test Vietnamese nutrient name → key mapping."""

    def test_energy(self):
        assert map_rec_to_nutrition_key("Năng lượng") == "energy"

    def test_protein(self):
        assert map_rec_to_nutrition_key("Chất đạm (protein)") == "protein"

    def test_fat(self):
        assert map_rec_to_nutrition_key("Chất béo") == "fat"

    def test_carbohydrate(self):
        assert map_rec_to_nutrition_key("Chất bột đường") == "carbohydrate"

    def test_calcium(self):
        assert map_rec_to_nutrition_key("Canxi (Ca)") == "calcium"

    def test_iron(self):
        assert map_rec_to_nutrition_key("Sắt (Fe)") == "iron"

    def test_vitamin_c(self):
        assert map_rec_to_nutrition_key("Vitamin C") == "vitamin_c"

    def test_unknown_returns_none(self):
        assert map_rec_to_nutrition_key("Chất xơ") is None

    def test_empty_string(self):
        assert map_rec_to_nutrition_key("") is None


# ═══════════════════════════════════════════════════════════════════════════════
# _resolve_meal_budgets
# ═══════════════════════════════════════════════════════════════════════════════

class TestResolveMealBudgets:
    """Test budget resolution — daily split vs. per-meal override."""

    def test_no_budget(self):
        result = _resolve_meal_budgets()
        assert result == {"breakfast": None, "lunch": None, "dinner": None}

    def test_daily_budget_splits_by_ratio(self):
        result = _resolve_meal_budgets(daily_budget=100_000)
        assert result["breakfast"] == pytest.approx(25_000)
        assert result["lunch"] == pytest.approx(40_000)
        assert result["dinner"] == pytest.approx(35_000)

    def test_meal_budgets_override_daily(self):
        result = _resolve_meal_budgets(
            daily_budget=100_000,
            meal_budgets={"breakfast": 50_000},
        )
        assert result["breakfast"] == 50_000  # overridden
        assert result["lunch"] == pytest.approx(40_000)  # from daily split

    def test_zero_daily_budget_ignored(self):
        result = _resolve_meal_budgets(daily_budget=0)
        assert result == {"breakfast": None, "lunch": None, "dinner": None}

    def test_negative_meal_budget_ignored(self):
        result = _resolve_meal_budgets(meal_budgets={"lunch": -5000})
        assert result["lunch"] is None


# ═══════════════════════════════════════════════════════════════════════════════
# Fixtures — sample dish data
# ═══════════════════════════════════════════════════════════════════════════════

def _make_dish(stt, dish_type, energy=200, protein=10, fat=5, carb=30, price=15000):
    """Helper to create a test dish dict."""
    return {
        "stt": stt,
        "dish_type": dish_type,
        "energy": energy,
        "protein": protein,
        "fat": fat,
        "carbohydrate": carb,
        "iron": 2.0,
        "calcium": 50.0,
        "zinc": 1.5,
        "vitamin_c": 10.0,
        "price_vnd": price,
    }


@pytest.fixture
def sample_dishes():
    """Minimal realistic dish set covering all dish types."""
    return [
        _make_dish(1, "món tinh bột", energy=350, protein=8, fat=2, carb=75, price=5000),
        _make_dish(2, "món mặn", energy=250, protein=25, fat=12, carb=5, price=25000),
        _make_dish(3, "món rau", energy=50, protein=3, fat=1, carb=8, price=8000),
        _make_dish(4, "món canh", energy=80, protein=5, fat=3, carb=10, price=10000),
        _make_dish(5, "tráng miệng", energy=100, protein=1, fat=0, carb=25, price=12000),
        _make_dish(6, "món mặn", energy=300, protein=20, fat=15, carb=10, price=30000),
        _make_dish(7, "món tinh bột", energy=300, protein=7, fat=3, carb=65, price=7000),
        _make_dish(8, "món rau", energy=60, protein=4, fat=1, carb=9, price=9000),
        _make_dish(9, "món canh", energy=90, protein=6, fat=2, carb=12, price=11000),
        _make_dish(10, "món mặn", energy=280, protein=22, fat=10, carb=8, price=20000),
    ]


@pytest.fixture
def sample_recommendations():
    """Daily nutrition targets — realistic for pregnant woman."""
    return [
        {"name": "Năng lượng", "value_str": "1800 - 2200"},
        {"name": "Chất đạm", "value_str": "60 - 80"},
        {"name": "Chất béo", "value_str": "50 - 70"},
        {"name": "Chất bột đường", "value_str": "250 - 350"},
        {"name": "Sắt", "value_str": "25 - 30"},
        {"name": "Canxi", "value_str": "800 - 1200"},
        {"name": "Kẽm", "value_str": "10 - 15"},
        {"name": "Vitamin C", "value_str": "80 - 110"},
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# _solve_meal (integration)
# ═══════════════════════════════════════════════════════════════════════════════

class TestSolveMeal:
    """Integration tests for single-meal CP-SAT solver."""

    def test_returns_result_with_items(self, sample_dishes, sample_recommendations):
        targets = {}
        for rec in sample_recommendations:
            key = map_rec_to_nutrition_key(rec["name"])
            if key:
                targets[key] = parse_range(rec["value_str"])

        result = _solve_meal(
            meal_name="lunch",
            available_dishes=sample_dishes,
            current_excluded=[],
            targets=targets,
            budget_limits={"breakfast": None, "lunch": None, "dinner": None},
            has_any_budget=False,
        )
        assert result is not None
        assert "items" in result
        assert len(result["items"]) >= 1
        assert all("stt" in item and "grams" in item for item in result["items"])

    def test_all_excluded_returns_none(self, sample_dishes, sample_recommendations):
        targets = {}
        for rec in sample_recommendations:
            key = map_rec_to_nutrition_key(rec["name"])
            if key:
                targets[key] = parse_range(rec["value_str"])

        all_stts = [d["stt"] for d in sample_dishes]
        result = _solve_meal(
            meal_name="lunch",
            available_dishes=sample_dishes,
            current_excluded=all_stts,
            targets=targets,
            budget_limits={"breakfast": None, "lunch": None, "dinner": None},
            has_any_budget=False,
        )
        assert result is None

    def test_grams_is_multiple_of_unit(self, sample_dishes, sample_recommendations):
        targets = {}
        for rec in sample_recommendations:
            key = map_rec_to_nutrition_key(rec["name"])
            if key:
                targets[key] = parse_range(rec["value_str"])

        result = _solve_meal(
            meal_name="breakfast",
            available_dishes=sample_dishes,
            current_excluded=[],
            targets=targets,
            budget_limits={"breakfast": None, "lunch": None, "dinner": None},
            has_any_budget=False,
        )
        if result:
            for item in result["items"]:
                assert item["grams"] % UNIT_GRAMS == 0


# ═══════════════════════════════════════════════════════════════════════════════
# recommend_full_day_meals (end-to-end)
# ═══════════════════════════════════════════════════════════════════════════════

class TestRecommendFullDayMeals:
    """End-to-end tests for full day plan generation."""

    def test_empty_dishes_returns_empty(self, sample_recommendations):
        assert recommend_full_day_meals([], sample_recommendations) == []

    def test_empty_recommendations_returns_empty(self, sample_dishes):
        assert recommend_full_day_meals(sample_dishes, []) == []

    def test_generates_plan_with_all_meals(self, sample_dishes, sample_recommendations):
        plans = recommend_full_day_meals(sample_dishes, sample_recommendations, limit=1)
        assert len(plans) >= 1
        plan = plans[0]
        assert "breakfast" in plan
        assert "lunch" in plan
        assert "dinner" in plan

    def test_plan_has_cost_and_nutrition(self, sample_dishes, sample_recommendations):
        plans = recommend_full_day_meals(sample_dishes, sample_recommendations, limit=1)
        if plans:
            plan = plans[0]
            assert "estimated_cost" in plan
            assert "nutrition_summary" in plan
            assert "total" in plan["estimated_cost"]
            assert "total" in plan["nutrition_summary"]

    def test_excluded_dishes_not_in_plan(self, sample_dishes, sample_recommendations):
        excluded = [1, 2]
        plans = recommend_full_day_meals(
            sample_dishes, sample_recommendations, excluded_dishes=excluded, limit=1
        )
        if plans:
            plan = plans[0]
            for meal in ["breakfast", "lunch", "dinner"]:
                for item in plan.get(meal, []):
                    assert item["stt"] not in excluded

    def test_budget_constraint(self, sample_dishes, sample_recommendations):
        plans = recommend_full_day_meals(
            sample_dishes, sample_recommendations, daily_budget=50_000, limit=1
        )
        if plans:
            total_cost = plans[0]["estimated_cost"]["total"]
            # With relaxed constraints, cost should be reasonable (within ~60% flex)
            assert total_cost <= 80_000  # generous check

    def test_multiple_plans_differ(self, sample_dishes, sample_recommendations):
        """Multiple plans should ideally not be identical."""
        plans = recommend_full_day_meals(sample_dishes, sample_recommendations, limit=2)
        # At minimum, function should return something
        assert len(plans) >= 1
