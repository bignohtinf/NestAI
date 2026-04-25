import sys
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

# Add the agents directory to sys.path to allow importing from optimization_food
APP_SERVICES_DIR = Path(__file__).resolve().parent
SRC_DIR = APP_SERVICES_DIR.parents[2]
AGENTS_ROOT = SRC_DIR / "agents"

if str(AGENTS_ROOT) not in sys.path:
    sys.path.append(str(AGENTS_ROOT))

# Now we can try to import the optimizer and loader
try:
    from optimization_food.src.engine.optimizer import recommend_full_day_meals
    from optimization_food.src.ingestion.loader import get_user_profiles, get_dish_details
except ImportError as e:
    print(f"Error importing optimization_food modules in service: {e}")
    recommend_full_day_meals = None
    get_user_profiles = None
    get_dish_details = None

def get_full_day_recommendations(
    user_profile_stt: int, 
    locked_meals: Dict[str, List[int]] = None,
    excluded_dishes: List[int] = None
) -> List[Dict[str, Any]]:
    """
    Get full day meal recommendations (breakfast, lunch, dinner).
    """
    if not recommend_full_day_meals:
        return {"error": "Recommendation engine not available"}
        
    # Get the specific profile
    try:
        profiles = get_user_profiles()
        user_profile = next((p for p in profiles if p["stt"] == user_profile_stt), None)
        
        if not user_profile:
            return {"error": f"Profile with STT {user_profile_stt} not found"}
            
        # Get plans (lists of STTs per meal)
        plans_stts = recommend_full_day_meals(user_profile, locked_meals, excluded_dishes)
        
        # Enrich with dish details
        results = []
        for plan in plans_stts:
            enriched_plan = {}
            for meal_name, stts in plan.items():
                if stts:
                    enriched_plan[meal_name] = {
                        "dishes": get_dish_details(stts),
                        "stts": stts
                    }
                else:
                    enriched_plan[meal_name] = {"dishes": [], "stts": []}
            results.append(enriched_plan)
            
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Error during recommendation: {str(e)}"}

def list_profiles() -> List[Dict[str, Any]]:
    """List all available nutritional profiles."""
    if not get_user_profiles:
        return []
    try:
        return get_user_profiles()
    except Exception as e:
        print(f"Error listing profiles: {e}")
        return []
