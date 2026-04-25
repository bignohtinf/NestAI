import re
import json
from typing import List, Dict, Any, Optional, Tuple
from ortools.sat.python import cp_model
from ..ingestion.loader import load_nutrition_data, load_recommendations, get_dish_details

# ---------------------------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------------------------

def parse_range(value_str: str) -> Tuple[float, float]:
    """Parse a value string into a (min, max) range."""
    # Matches ranges like "550.0 - 650.0" or single numbers
    range_match = re.findall(r"(\d+\.?\d*)", value_str.replace(",", "."))
    if len(range_match) >= 2:
        return float(range_match[0]), float(range_match[1])
    elif len(range_match) == 1:
        val = float(range_match[0])
        # Apply 5% delta if it's a single number
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
# Core Optimization Logic
# ---------------------------------------------------------------------------

def recommend_full_day_meals(
    user_profile: Dict[str, Any], 
    locked_meals: Dict[str, List[int]] = None,
    excluded_dishes: List[int] = None, 
    limit: int = 5
) -> List[Dict[str, List[int]]]:
    """
    Generate breakfast, lunch, and dinner recommendations.
    
    Args:
        user_profile: Profile dict
        locked_meals: Dict like {'breakfast': [stt1, stt2]} for pre-selected meals
        excluded_dishes: List of STTs to never include
        limit: Number of full-day plans to return
    """
    profile_stt = user_profile.get("stt")
    if profile_stt is None:
        return []
        
    all_nutrition = load_nutrition_data()
    daily_recommendations = load_recommendations(profile_stt)
    excluded = excluded_dishes or []
    locked = locked_meals or {}
    
    # 1. Define distribution of daily nutrients per meal
    # Breakfast: 20%, Lunch: 40%, Dinner: 40% (Approximate)
    MEAL_RATIOS = {
        "breakfast": 0.25,
        "lunch": 0.40,
        "dinner": 0.35
    }
    
    PRIMARY_KEYS = ["energy", "protein", "fat", "carbohydrate"]
    SCALE = 100
    
    # 2. Extract targets
    targets = {}
    for rec in daily_recommendations:
        key = map_rec_to_nutrition_key(rec["name"])
        if key in PRIMARY_KEYS:
            targets[key] = parse_range(rec["value_str"])

    if not targets:
        return []

    # 3. Solve per meal (Sequential approach for better performance and simplicity)
    # In a more complex version, we could solve all meals together, 
    # but sequential allows easier user interaction (lock/unlock).
    
    available_dishes = [d for d in all_nutrition if d["stt"] not in excluded]
    
    final_plans = []
    
    for _ in range(limit):
        day_plan = {}
        current_excluded = list(excluded)
        
        for meal_name in ["breakfast", "lunch", "dinner"]:
            if meal_name in locked and locked[meal_name]:
                day_plan[meal_name] = locked[meal_name]
                current_excluded.extend(locked[meal_name])
                continue
            
            # Create sub-problem for this meal
            model = cp_model.CpModel()
            dish_vars = {}
            meal_available = [d for d in available_dishes if d["stt"] not in current_excluded]
            
            for dish in meal_available:
                dish_vars[dish["stt"]] = model.NewBoolVar(f'{meal_name}_dish_{dish["stt"]}')
            
            # Apply nutrient constraints for this meal
            ratio = MEAL_RATIOS[meal_name]
            for key, (min_val, max_val) in targets.items():
                total_nutrient = sum(
                    int(dish.get(key, 0) * SCALE) * dish_vars[dish["stt"]]
                    for dish in meal_available
                )
                model.Add(total_nutrient >= int(min_val * ratio * 0.8 * SCALE)) # 20% flexibility
                model.Add(total_nutrient <= int(max_val * ratio * 1.2 * SCALE))

            # Apply structure constraints
            total_dishes = sum(dish_vars.values())
            if meal_name == "breakfast":
                model.Add(total_dishes >= 1)
                model.Add(total_dishes <= 3)
                # At least one món mặn or món tinh bột for breakfast usually
                mon_man_vars = [dish_vars[d["stt"]] for d in meal_available if d["dish_type"] == "món mặn"]
                if mon_man_vars:
                    model.Add(sum(mon_man_vars) >= 1)
            else:
                # Lunch/Dinner: 3-5 dishes
                model.Add(total_dishes >= 3)
                model.Add(total_dishes <= 5)
                
                # Type requirements
                type_reqs = ["món mặn", "món rau", "món tinh bột", "món canh"]
                for t in type_reqs:
                    vars_of_type = [dish_vars[d["stt"]] for d in meal_available if d["dish_type"] == t]
                    if vars_of_type:
                        model.Add(sum(vars_of_type) >= 1)

            # Solver
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = 2.0
            status = solver.Solve(model)
            
            if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
                selected = [stt for stt, var in dish_vars.items() if solver.Value(var)]
                day_plan[meal_name] = selected
                current_excluded.extend(selected)
            else:
                day_plan[meal_name] = [] # Failed to find combo
        
        if day_plan["breakfast"] or day_plan["lunch"] or day_plan["dinner"]:
            final_plans.append(day_plan)
            
    return final_plans
