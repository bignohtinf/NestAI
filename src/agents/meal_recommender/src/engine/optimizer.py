import re
from typing import List, Dict, Any, Optional, Tuple
from ortools.sat.python import cp_model
from ..ingestion.loader import load_nutrition_data, load_recommendations

# ---------------------------------------------------------------------------
# Utility Functions
# ---------------------------------------------------------------------------

def parse_range(value_str: str) -> Tuple[float, float]:
    """Parse a value string into a (min, max) range."""
    range_match = re.findall(r"(\d+\.?\d*)", value_str)
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
        "Chất xơ": "fiber"
    }
    for k, v in mapping.items():
        if k in rec_name:
            return v
    return None

# ---------------------------------------------------------------------------
# Core Optimization Logic
# ---------------------------------------------------------------------------

def recommend_meals(user_profile: Dict[str, Any], excluded_dishes: List[int], limit: int = 20) -> List[List[int]]:
    """
    Find feasible dish combinations based on nutritional recommendations using CP-SAT solver.
    
    Args:
        user_profile: User profile dict containing 'stt'
        excluded_dishes: List of dish STTs to exclude
        limit: Maximum number of combinations to return
        
    Returns:
        List of lists of dish STTs that meet the requirements.
    """
    profile_stt = user_profile.get("stt")
    if profile_stt is None:
        return []
        
    all_nutrition = load_nutrition_data()
    recommendations = load_recommendations(profile_stt)
    
    # Filter available dishes
    available_dishes = [d for d in all_nutrition if d["stt"] not in excluded_dishes]
    if not available_dishes:
        return []
    
    # Define optimization problem
    model = cp_model.CpModel()
    
    # Variables: x[i] is 1 if dish i is selected, 0 otherwise
    dish_vars = {}
    for dish in available_dishes:
        dish_vars[dish["stt"]] = model.NewBoolVar(f'dish_{dish["stt"]}')
        
    PRIMARY_KEYS = ["energy", "protein", "fat", "carbohydrate"]
    SCALE = 100
    
    # Add constraints for each recommendation
    constraints_added = 0
    for rec in recommendations:
        key = map_rec_to_nutrition_key(rec["name"])
        if not key or key not in PRIMARY_KEYS:
            continue
            
        min_val, max_val = parse_range(rec["value_str"])
        if max_val == 0:
            continue
            
        # Total nutrient sum constraint
        total_nutrient = sum(
            int(dish.get(key, 0) * SCALE) * dish_vars[dish["stt"]]
            for dish in available_dishes
        )
        
        model.Add(total_nutrient >= int(min_val * SCALE))
        model.Add(total_nutrient <= int(max_val * SCALE))
        constraints_added += 1

    if constraints_added == 0:
        return []

    # Constraint: limit to reasonable number of dishes per meal combo (2 to 5)
    total_dishes = sum(dish_vars.values())
    model.Add(total_dishes >= 2)
    model.Add(total_dishes <= 5)

    # Solver
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0
    
    class SolutionCollector(cp_model.CpSolverSolutionCallback):
        def __init__(self, variables, limit):
            cp_model.CpSolverSolutionCallback.__init__(self)
            self.__variables = variables
            self.solutions = []
            self.limit = limit

        def on_solution_callback(self):
            if len(self.solutions) >= self.limit:
                self.StopSearch()
                return
                
            selected_stts = [
                stt for stt, var in self.__variables.items() if self.Value(var)
            ]
            self.solutions.append(selected_stts)

    collector = SolutionCollector(dish_vars, limit)
    solver.SearchForAllSolutions(model, collector)
    
    return collector.solutions
