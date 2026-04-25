import csv
import json
from pathlib import Path
from typing import List, Dict, Any

# ---------------------------------------------------------------------------
# Path Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
DISHES_DIR = RAW_DIR / "dishes"
PROFILES_DIR = RAW_DIR / "profiles"
RECOMMENDATIONS_DIR = PROFILES_DIR / "recommendations"

def load_nutrition_data() -> List[Dict[str, Any]]:
    """Load nutritional data for all dishes from raw CSV and enrich with dish_type."""
    nutrition_file = DISHES_DIR / "raw_nutrition_table.csv"
    dish_file = DISHES_DIR / "raw_dish_table.csv"
    
    if not nutrition_file.exists() or not dish_file.exists():
        return []
    
    # Load dish types mapping
    dish_types = {}
    with open(dish_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                stt = int(row["stt"])
                dish_types[stt] = row.get("dish_type", "món mặn")
            except:
                continue

    data = []
    with open(nutrition_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        if rows and "kcal" in rows[0].get("energy", ""):
            rows = rows[1:]
            
        for row in rows:
            clean_row = {}
            for k, v in row.items():
                if k == "stt":
                    try:
                        clean_row[k] = int(v)
                    except:
                        continue
                elif v and isinstance(v, str) and v.strip() and v != "-":
                    try:
                        val = v.strip().replace(",", ".")
                        clean_row[k] = float(val)
                    except ValueError:
                        clean_row[k] = 0.0
                else:
                    clean_row[k] = 0.0
            
            if "stt" in clean_row:
                clean_row["dish_type"] = dish_types.get(clean_row["stt"], "món mặn")
                data.append(clean_row)
    return data

def load_recommendations(profile_stt: int) -> List[Dict[str, Any]]:
    """Load nutritional recommendations for a specific profile."""
    rec_file = RECOMMENDATIONS_DIR / f"{profile_stt}.csv"
    if not rec_file.exists():
        return []
    
    recs = []
    with open(rec_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("Nhu cầu dinh dưỡng khuyến nghị", "")
            value_str = row.get("Giá trị", "")
            
            if not value_str or value_str == "-":
                continue
                
            recs.append({
                "name": name,
                "unit": row.get("Đơn vị tính", ""),
                "value_str": value_str
            })
    return recs

def get_user_profiles() -> List[Dict[str, Any]]:
    """Return all available user demographic profiles."""
    profiles_file = PROFILES_DIR / "profiles.json"
    if not profiles_file.exists():
        return []
    with open(profiles_file, "r", encoding="utf-8") as f:
        return json.load(f)

def get_dish_details(stts: List[int]) -> List[Dict[str, Any]]:
    """Get name and category details for a list of dish STTs."""
    dish_file = DISHES_DIR / "raw_dish_table.csv"
    if not dish_file.exists():
        return []
    
    details = []
    with open(dish_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                row_stt = int(row["stt"])
                if row_stt in stts:
                    details.append(row)
            except (ValueError, KeyError):
                continue
    return details
