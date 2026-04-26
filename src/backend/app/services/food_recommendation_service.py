"""
Food Recommendation Service — fetches data from Supabase and runs CP-SAT optimizer.
"""

import sys
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.core.supabase_client import get_supabase

# Add agents to path for optimizer import
APP_SERVICES_DIR = Path(__file__).resolve().parent

# Check for both local development path and Docker path
AGENTS_ROOT_LOCAL = APP_SERVICES_DIR.parents[2] / "agents"
AGENTS_ROOT_DOCKER = APP_SERVICES_DIR.parents[1] / "agents"

AGENTS_ROOT = AGENTS_ROOT_DOCKER if AGENTS_ROOT_DOCKER.exists() else AGENTS_ROOT_LOCAL

if str(AGENTS_ROOT) not in sys.path:
    sys.path.append(str(AGENTS_ROOT))

try:
    from optimization_food.src.engine.optimizer import recommend_full_day_meals
except ImportError as e:
    logging.error(f"Failed to import optimizer: {e}")
    recommend_full_day_meals = None

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data Fetching (Supabase)
# ---------------------------------------------------------------------------

def _fetch_all_dishes() -> List[Dict[str, Any]]:
    """Fetch all dishes with nutrition data from Supabase."""
    supabase = get_supabase()
    
    # Fetch in pages (Supabase default limit is 1000)
    all_rows = []
    page_size = 1000
    offset = 0
    
    while True:
        result = (
            supabase.table("nutrition_database")
            .select("stt, dish_type, energy, protein, fat, carbohydrate, "
                    "calcium, iron, zinc, vitamin_a, vitamin_c, sodium, price_vnd")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        
        rows = result.data or []
        all_rows.extend(rows)
        
        if len(rows) < page_size:
            break
        offset += page_size
    
    return all_rows


def _fetch_recommendations(profile_stt: int) -> List[Dict[str, Any]]:
    """Fetch nutritional recommendations for a profile from Supabase."""
    supabase = get_supabase()
    
    result = (
        supabase.table("nutrition_recommendations")
        .select("nutrient_name, unit, value_str")
        .eq("profile_stt", profile_stt)
        .execute()
    )
    
    return result.data or []


def _fetch_dish_details(stts: List[int]) -> List[Dict[str, Any]]:
    """Fetch dish display info for a list of STTs from Supabase."""
    if not stts:
        return []
    
    supabase = get_supabase()
    
    result = (
        supabase.table("nutrition_database")
        .select("stt, dish_id, dish_name_vi, dish_name_en, dish_type, "
                "group_name_vi, energy, protein, fat, carbohydrate, price_vnd")
        .in_("stt", stts)
        .execute()
    )
    
    return result.data or []


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_full_day_recommendations(
    user_profile_stt: int, 
    locked_meals: Dict[str, List[int]] = None,
    excluded_dishes: List[int] = None,
    daily_budget: Optional[float] = None,
    meal_budgets: Optional[Dict[str, float]] = None,
) -> Any:
    """
    Get full day meal recommendations (breakfast, lunch, dinner).
    
    1. Fetch all dishes from Supabase
    2. Fetch recommendations for the profile
    3. Run CP-SAT optimizer (with optional budget constraints)
    4. Enrich results with dish details
    
    Args:
        daily_budget: Total daily budget in VNĐ (split by meal ratio 25/40/35)
        meal_budgets: Per-meal budgets in VNĐ, e.g. {'breakfast': 30000, 'lunch': 50000}
    """
    if not recommend_full_day_meals:
        return {"error": "Recommendation engine not available (ortools not installed)"}
        
    try:
        # 1. Fetch data from Supabase
        all_dishes = _fetch_all_dishes()
        if not all_dishes:
            return {"error": "No dishes found in database. Run seed script first."}
        
        daily_recs = _fetch_recommendations(user_profile_stt)
        if not daily_recs:
            return {"error": f"No recommendations found for profile STT {user_profile_stt}"}
        
        # 2. Run optimizer (pure function — no DB access)
        plans = recommend_full_day_meals(
            all_dishes=all_dishes,
            daily_recommendations=daily_recs,
            locked_meals=locked_meals,
            excluded_dishes=excluded_dishes,
            daily_budget=daily_budget,
            meal_budgets=meal_budgets,
        )
        
        # 3. Enrich with dish details
        results = []
        for plan in plans:
            enriched_plan = {}
            estimated_cost = plan.pop("estimated_cost", None)
            nutrition_summary = plan.pop("nutrition_summary", None)
            
            for meal_name in ["breakfast", "lunch", "dinner"]:
                items = plan.get(meal_name, [])
                if items:
                    # items is a list of {stt, units, grams}
                    stts = [item["stt"] for item in items]
                    dish_details = _fetch_dish_details(stts)
                    
                    # Merge portion info with dish details
                    details_by_stt = {d["stt"]: d for d in dish_details}
                    enriched_items = []
                    for item in items:
                        detail = details_by_stt.get(item["stt"], {})
                        enriched_items.append({
                            **detail,
                            "units": item["units"],
                            "grams": item["grams"],
                        })
                    
                    enriched_plan[meal_name] = {
                        "dishes": enriched_items,
                        "stts": stts,
                    }
                else:
                    enriched_plan[meal_name] = {"dishes": [], "stts": []}
            
            if estimated_cost:
                enriched_plan["estimated_cost"] = estimated_cost
            if nutrition_summary:
                enriched_plan["nutrition_summary"] = nutrition_summary
                
            results.append(enriched_plan)
            
        return results
        
    except Exception as e:
        logger.error(f"Recommendation error: {e}", exc_info=True)
        return {"error": f"Error during recommendation: {str(e)}"}


def list_profiles() -> Any:
    """List all available nutritional profiles from Supabase."""
    try:
        supabase = get_supabase()
        
        result = (
            supabase.table("nutrition_profiles")
            .select("stt, age_group, gender, labor_level, physiological_condition")
            .order("stt")
            .execute()
        )
        
        profiles = result.data or []
        
        # Format to match frontend expectation (profile dict with Vietnamese keys)
        formatted = []
        for p in profiles:
            formatted.append({
                "stt": p["stt"],
                "profile": {
                    "Nhóm tuổi/Age group": p.get("age_group", ""),
                    "Giới tính/Gender": p.get("gender", ""),
                    "Mức độ lao động/Labor Level": p.get("labor_level", ""),
                    "Tình trạng sinh lý/Physiological condition": p.get("physiological_condition", ""),
                }
            })
        
        return formatted
        
    except Exception as e:
        logger.error(f"Error listing profiles: {e}", exc_info=True)
        return {"error": f"Failed to fetch profiles: {str(e)}"}
