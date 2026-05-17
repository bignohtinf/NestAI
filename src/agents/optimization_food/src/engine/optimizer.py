"""
Core CP-SAT optimization logic for meal recommendations.

This module is a pure computation engine — it receives data and returns results.
All data fetching (from Supabase or CSV) is handled by the caller.

Nutrition data is per 100g. The optimizer uses IntVar (0..MAX_UNITS) to determine
the number of portion units for each dish. Each unit = UNIT_GRAMS (default 50g),
allowing fine-grained portions like 150g, 250g, 350g.

Example: IntVar = 5, UNIT_GRAMS = 50 → 250g → nutrition = value_per_100g × 2.5
"""

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from ortools.sat.python import cp_model

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Portion unit size in grams (smaller = finer granularity)
# CP-SAT only supports integers, so we use small units to simulate floats
UNIT_GRAMS = 50  # Each IntVar unit = 50g

# Max portion units per dish (e.g., 10 units × 50g = 500g max)
MAX_UNITS = 10

# Integer scale factor for CP-SAT nutrient calculations
# Nutrients are per 100g, so 1 unit (50g) contributes nutrient × 50/100 = nutrient × 0.5
# We scale by 1000 to preserve precision: int(nutrient * 1000 * UNIT_GRAMS / 100)
SCALE = 1000
NUTRIENT_PER_UNIT = UNIT_GRAMS / 100.0  # = 0.5 for 50g units

# Meal nutrient distribution ratios
MEAL_RATIOS = {
    "breakfast": 0.25,
    "lunch": 0.40,
    "dinner": 0.35,
}

# Default portion sizes per dish type (in units of UNIT_GRAMS)
# e.g., 6 units × 50g = 300g for rice/noodles
DEFAULT_PORTIONS = {
    "món tinh bột": 6,   # Cơm/phở ~300g
    "món mặn": 4,        # Thịt/cá ~200g
    "món rau": 3,        # Rau ~150g
    "món canh": 5,        # Canh ~250g
    "tráng miệng": 2,   # Trái cây ~100g
}

# Max dishes and total units per meal
MEAL_STRUCTURE = {
    "breakfast": {"min_dishes": 1, "max_dishes": 3, "max_total_units": 14},  # ~700g max
    "lunch":     {"min_dishes": 3, "max_dishes": 5, "max_total_units": 22},  # ~1100g max
    "dinner":    {"min_dishes": 3, "max_dishes": 5, "max_total_units": 20},  # ~1000g max
}

PRIMARY_NUTRIENT_KEYS = ["energy", "protein", "fat", "carbohydrate", "iron", "calcium", "zinc", "vitamin_c"]

# ---------------------------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------------------------

def parse_range(value_str: str) -> Tuple[float, float]:
    """Parse a value string into a (min, max) range."""
    range_match = re.findall(r"(\d+\.?\d*)", value_str.replace(",", "."))
    if len(range_match) >= 2:
        return float(range_match[0]), float(range_match[1])
    elif len(range_match) == 1:
        val = float(range_match[0])
        return val * 0.95, val * 1.05
    return 0.0, 0.0


def map_rec_to_nutrition_key(rec_name: str) -> Optional[str]:
    """Map recommendation names to nutrition table keys."""
    mapping = {
        "Năng lượng": "energy",
        "Chất đạm": "protein",
        "Chất béo": "fat",
        "Chất bột đường": "carbohydrate",
        "Canxi": "calcium",
        "Sắt": "iron",
        "Kẽm": "zinc",
        "Vitamin A": "vitamin_a",
        "Vitamin C": "vitamin_c",
        "Natri": "sodium",
    }
    for k, v in mapping.items():
        if k in rec_name:
            return v
    return None


# ---------------------------------------------------------------------------
# Budget Helpers
# ---------------------------------------------------------------------------

def _resolve_meal_budgets(
    daily_budget: Optional[float] = None,
    meal_budgets: Optional[Dict[str, float]] = None,
) -> Dict[str, Optional[float]]:
    """
    Resolve per-meal budget limits (VNĐ).

    Priority:
      1. Explicit per-meal budget (meal_budgets['breakfast'] = 30000)
      2. Daily budget split by meal ratio (25/40/35)
      3. None → no budget constraint for that meal
    """
    resolved: Dict[str, Optional[float]] = {
        "breakfast": None,
        "lunch": None,
        "dinner": None,
    }

    if daily_budget is not None and daily_budget > 0:
        for meal, ratio in MEAL_RATIOS.items():
            resolved[meal] = daily_budget * ratio

    if meal_budgets:
        for meal, budget in meal_budgets.items():
            if meal in resolved and budget is not None and budget > 0:
                resolved[meal] = budget

    return resolved


# ---------------------------------------------------------------------------
# Core Optimization Logic
# ---------------------------------------------------------------------------

def _solve_meal(
    meal_name: str,
    available_dishes: List[Dict[str, Any]],
    current_excluded: List[int],
    targets: Dict[str, Tuple[float, float]],
    budget_limits: Dict[str, Optional[float]],
    has_any_budget: bool,
) -> Optional[Dict[str, Any]]:
    """
    Solve a single meal with CP-SAT. If strict constraints fail, retry with
    relaxed nutrient bands and optional dish-type requirements.
    """
    meal_available = [d for d in available_dishes if d["stt"] not in current_excluded]
    if not meal_available:
        logger.warning(f"[optimizer] {meal_name}: no dishes available after exclusion")
        return None

    structure = MEAL_STRUCTURE[meal_name]

    # Log available dish types for debugging
    type_counts: Dict[str, int] = {}
    for d in meal_available:
        t = d.get("dish_type", "unknown")
        type_counts[t] = type_counts.get(t, 0) + 1
    logger.info(f"[optimizer] {meal_name}: {len(meal_available)} dishes available, types={type_counts}")

    # Try strict first (flexibility=0.2), then relaxed (0.4), then very relaxed (0.6, no type req)
    attempts = [
        {"flex": 0.2, "require_types": True,  "label": "strict"},
        {"flex": 0.4, "require_types": True,  "label": "relaxed"},
        {"flex": 0.6, "require_types": False, "label": "no-type-req"},
    ]

    for attempt in attempts:
        flex = attempt["flex"]
        require_types = attempt["require_types"]
        label = attempt["label"]

        model = cp_model.CpModel()
        dish_vars: Dict[int, Any] = {}
        is_selected: Dict[int, Any] = {}

        for dish in meal_available:
            stt = dish["stt"]
            default_units = DEFAULT_PORTIONS.get(dish["dish_type"], 4)
            max_u = min(MAX_UNITS, default_units + 2)
            dish_vars[stt] = model.NewIntVar(0, max_u, f'{meal_name}_u_{stt}')
            is_selected[stt] = model.NewBoolVar(f'{meal_name}_sel_{stt}')
            model.Add(dish_vars[stt] >= 1).OnlyEnforceIf(is_selected[stt])
            model.Add(dish_vars[stt] == 0).OnlyEnforceIf(is_selected[stt].Not())

        # Nutrient constraints with adjustable flexibility
        ratio = MEAL_RATIOS[meal_name]
        for key, (min_val, max_val) in targets.items():
            total_nutrient = sum(
                int(dish.get(key, 0) * NUTRIENT_PER_UNIT * SCALE) * dish_vars[dish["stt"]]
                for dish in meal_available
            )
            model.Add(total_nutrient >= int(min_val * ratio * (1 - flex) * SCALE))
            model.Add(total_nutrient <= int(max_val * ratio * (1 + flex) * SCALE))

        # Structure constraints
        total_selected = sum(is_selected.values())
        min_dishes = structure["min_dishes"] if require_types else 1
        model.Add(total_selected >= min_dishes)
        model.Add(total_selected <= structure["max_dishes"])
        model.Add(sum(dish_vars.values()) <= structure["max_total_units"])

        # Dish type diversity
        if meal_name == "breakfast":
            starch_or_savory = [
                is_selected[d["stt"]] for d in meal_available
                if d["dish_type"] in ("món mặn", "món tinh bột")
            ]
            if starch_or_savory:
                model.Add(sum(starch_or_savory) >= 1)
        elif require_types:
            type_reqs = ["món mặn", "món rau", "món tinh bột", "món canh"]
            for t in type_reqs:
                vars_of_type = [is_selected[d["stt"]] for d in meal_available if d["dish_type"] == t]
                if vars_of_type:
                    model.Add(sum(vars_of_type) >= 1)

        # Budget
        meal_budget = budget_limits.get(meal_name)
        if meal_budget is not None:
            total_cost = sum(
                int((dish.get("price_vnd") or 0) * NUTRIENT_PER_UNIT * SCALE) * dish_vars[dish["stt"]]
                for dish in meal_available
            )
            model.Add(total_cost <= int(meal_budget * SCALE))

        # Objective
        if has_any_budget:
            cost_obj = sum(
                int((dish.get("price_vnd") or 0) * NUTRIENT_PER_UNIT * SCALE) * dish_vars[dish["stt"]]
                for dish in meal_available
            )
            model.Minimize(cost_obj)

        # Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 5.0
        status = solver.Solve(model)

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            selected_items = []
            meal_cost = 0.0
            meal_nutrients = {k: 0.0 for k in PRIMARY_NUTRIENT_KEYS}

            for dish in meal_available:
                stt = dish["stt"]
                units = solver.Value(dish_vars[stt])
                if units > 0:
                    grams = units * UNIT_GRAMS
                    factor = units * NUTRIENT_PER_UNIT
                    selected_items.append({"stt": stt, "units": units, "grams": grams})
                    meal_cost += (dish.get("price_vnd") or 0) * factor
                    for k in PRIMARY_NUTRIENT_KEYS:
                        meal_nutrients[k] += dish.get(k, 0) * factor

            logger.info(f"[optimizer] {meal_name}: solved ({label}), {len(selected_items)} dishes, {round(meal_nutrients.get('energy', 0))} kcal")
            return {
                "items": selected_items,
                "cost": round(meal_cost, 0),
                "nutrition": {k: round(v, 1) for k, v in meal_nutrients.items()},
            }
        else:
            logger.warning(f"[optimizer] {meal_name}: {label} attempt INFEASIBLE, trying next...")

    logger.error(f"[optimizer] {meal_name}: ALL attempts failed — no feasible solution")
    return None


def recommend_full_day_meals(
    all_dishes: List[Dict[str, Any]],
    daily_recommendations: List[Dict[str, Any]],
    locked_meals: Dict[str, List[int]] = None,
    excluded_dishes: List[int] = None,
    limit: int = 5,
    daily_budget: Optional[float] = None,
    meal_budgets: Optional[Dict[str, float]] = None,
) -> List[Dict[str, Any]]:
    """
    Generate breakfast, lunch, and dinner recommendations using CP-SAT solver.

    Each dish can have 0..MAX_SERVINGS servings (each serving = 100g).
    Nutrient contributions scale linearly with servings.

    Args:
        all_dishes: List of dish dicts with keys: stt, dish_type, energy, protein,
                    fat, carbohydrate, price_vnd (optional), serving_size (optional), ...
        daily_recommendations: List of recommendation dicts with keys:
                               nutrient_name, unit, value_str
        locked_meals: Dict like {'breakfast': [stt1, stt2]} for pre-selected meals
        excluded_dishes: List of STTs to never include
        limit: Number of full-day plans to return
        daily_budget: Total daily budget in VNĐ
        meal_budgets: Per-meal budgets in VNĐ

    Returns:
        List of day plans:
        {
            'breakfast': [
                {'stt': 5, 'servings': 3, 'grams': 300},
                {'stt': 120, 'servings': 1, 'grams': 100},
            ],
            'lunch': [...],
            'dinner': [...],
            'estimated_cost': {'breakfast': float, 'lunch': float, 'dinner': float, 'total': float},
            'nutrition_summary': {
                'breakfast': {'energy': float, 'protein': float, ...},
                'lunch': {...},
                'dinner': {...},
                'total': {...}
            }
        }
    """
    if not all_dishes or not daily_recommendations:
        return []

    excluded = excluded_dishes or []
    locked = locked_meals or {}

    # 1. Extract daily nutrient targets from recommendations
    targets = {}
    for rec in daily_recommendations:
        name = rec.get("nutrient_name") or rec.get("name", "")
        key = map_rec_to_nutrition_key(name)
        if key in PRIMARY_NUTRIENT_KEYS:
            targets[key] = parse_range(rec["value_str"])

    if not targets:
        return []

    # 2. Resolve budget constraints
    budget_limits = _resolve_meal_budgets(daily_budget, meal_budgets)
    has_any_budget = any(v is not None for v in budget_limits.values())

    # 3. Filter available dishes
    available_dishes = [d for d in all_dishes if d["stt"] not in excluded]

    # Pre-compute unit size for each dish
    for d in available_dishes:
        d.setdefault("unit_grams", UNIT_GRAMS)

    final_plans = []

    for _ in range(limit):
        day_plan: Dict[str, Any] = {}
        day_cost: Dict[str, float] = {}
        day_nutrition: Dict[str, Dict[str, float]] = {}
        current_excluded = list(excluded)

        for meal_name in ["breakfast", "lunch", "dinner"]:
            # ─── Handle locked meals ────────────────────────────────
            if meal_name in locked and locked[meal_name]:
                locked_stts = locked[meal_name]
                day_plan[meal_name] = [
                    {
                        "stt": stt,
                        "units": DEFAULT_PORTIONS.get(
                            next((d["dish_type"] for d in available_dishes if d["stt"] == stt), "món mặn"), 2
                        ),
                        "grams": DEFAULT_PORTIONS.get(
                            next((d["dish_type"] for d in available_dishes if d["stt"] == stt), "món mặn"), 2
                        ) * UNIT_GRAMS,
                    }
                    for stt in locked_stts
                ]
                # Calculate cost & nutrition for locked meals
                locked_cost = 0.0
                locked_nutrition = {k: 0.0 for k in PRIMARY_NUTRIENT_KEYS}
                for item in day_plan[meal_name]:
                    dish = next((d for d in available_dishes if d["stt"] == item["stt"]), None)
                    if dish:
                        factor = item["units"] * NUTRIENT_PER_UNIT
                        locked_cost += (dish.get("price_vnd") or 0) * factor
                        for k in PRIMARY_NUTRIENT_KEYS:
                            locked_nutrition[k] += dish.get(k, 0) * factor
                day_cost[meal_name] = locked_cost
                day_nutrition[meal_name] = locked_nutrition
                current_excluded.extend(locked_stts)
                continue

            # ─── Solve meal (with retry on relaxed constraints) ─────
            result = _solve_meal(
                meal_name=meal_name,
                available_dishes=available_dishes,
                current_excluded=current_excluded,
                targets=targets,
                budget_limits=budget_limits,
                has_any_budget=has_any_budget,
            )

            if result:
                day_plan[meal_name] = result["items"]
                day_cost[meal_name] = result["cost"]
                day_nutrition[meal_name] = result["nutrition"]
                current_excluded.extend([item["stt"] for item in result["items"]])
            else:
                day_plan[meal_name] = []
                day_cost[meal_name] = 0
                day_nutrition[meal_name] = {k: 0.0 for k in PRIMARY_NUTRIENT_KEYS}

        # ─── Aggregate day totals ───────────────────────────────────
        has_any_meals = any(day_plan[m] for m in ["breakfast", "lunch", "dinner"])
        if has_any_meals:
            day_cost["total"] = sum(day_cost.get(m, 0) for m in ["breakfast", "lunch", "dinner"])

            # Nutrition totals
            total_nutrition = {k: 0.0 for k in PRIMARY_NUTRIENT_KEYS}
            for m in ["breakfast", "lunch", "dinner"]:
                for k in PRIMARY_NUTRIENT_KEYS:
                    total_nutrition[k] += day_nutrition.get(m, {}).get(k, 0.0)
            day_nutrition["total"] = {k: round(v, 1) for k, v in total_nutrition.items()}

            day_plan["estimated_cost"] = day_cost
            day_plan["nutrition_summary"] = day_nutrition
            final_plans.append(day_plan)

    return final_plans
