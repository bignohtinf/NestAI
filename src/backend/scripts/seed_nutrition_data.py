"""
Seed nutrition data from optimization_food agent CSV files into Supabase.

Usage:
    cd src/backend
    python -m scripts.seed_nutrition_data

Requires:
    - Migration 004_nutrition_optimization.sql already applied
    - CSV files in src/agents/optimization_food/data/raw/
    - .env with SUPABASE_URL and SUPABASE_SERVICE_KEY
"""

import csv
import json
import sys
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Load .env from backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    sys.exit(1)

# Data paths (from optimization_food agent)
AGENTS_DIR = BACKEND_DIR.parent / "agents" / "optimization_food"
DISHES_DIR = AGENTS_DIR / "data" / "raw" / "dishes"
PROFILES_DIR = AGENTS_DIR / "data" / "raw" / "profiles"
RECOMMENDATIONS_DIR = PROFILES_DIR / "recommendations"

DISH_TABLE_CSV = DISHES_DIR / "raw_dish_table.csv"
NUTRITION_TABLE_CSV = DISHES_DIR / "raw_nutrition_table.csv"
PROFILES_JSON = PROFILES_DIR / "profiles.json"

# Supabase client with service key (bypasses RLS)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Batch size for Supabase inserts
BATCH_SIZE = 100


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def upsert_batch(table: str, rows: list, batch_size: int = BATCH_SIZE):
    """Insert rows in batches. Uses upsert to be idempotent."""
    total = len(rows)
    inserted = 0
    for i in range(0, total, batch_size):
        batch = rows[i : i + batch_size]
        try:
            supabase.table(table).upsert(batch, on_conflict="stt").execute()
            inserted += len(batch)
            logger.info(f"  {table}: {inserted}/{total}")
        except Exception as e:
            logger.error(f"  {table} batch {i}-{i+len(batch)} failed: {e}")
            # Try one by one for failed batch
            for row in batch:
                try:
                    supabase.table(table).upsert(row, on_conflict="stt").execute()
                    inserted += 1
                except Exception as e2:
                    logger.error(f"  {table} row stt={row.get('stt')} failed: {e2}")
    return inserted


def safe_float(value: str, default: float = 0.0) -> float:
    """Convert string to float, handling commas and dashes."""
    if not value or not isinstance(value, str) or value.strip() in ("", "-"):
        return default
    try:
        return float(value.strip().replace(",", "."))
    except ValueError:
        return default


def safe_int(value: str, default: int = 0) -> int:
    """Convert string to int."""
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


# ---------------------------------------------------------------------------
# 1. Seed nutrition_database (dishes + nutrition joined by stt)
# ---------------------------------------------------------------------------

def seed_nutrition_database():
    """Load raw_dish_table.csv + raw_nutrition_table.csv → nutrition_database."""
    logger.info("=" * 60)
    logger.info("Seeding nutrition_database...")

    if not DISH_TABLE_CSV.exists():
        logger.error(f"Dish table not found: {DISH_TABLE_CSV}")
        return
    if not NUTRITION_TABLE_CSV.exists():
        logger.error(f"Nutrition table not found: {NUTRITION_TABLE_CSV}")
        return

    # --- Load dish info ---
    dishes = {}
    with open(DISH_TABLE_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                stt = int(row["stt"])
                dishes[stt] = {
                    "dish_id": row.get("id", ""),
                    "group_name_vi": row.get("group_name_vietnamese", ""),
                    "group_name_en": row.get("group_name_english", ""),
                    "dish_name_vi": row.get("dish_name_vietnamese", ""),
                    "dish_name_en": row.get("dish_name_english", ""),
                    "dish_type": row.get("dish_type", "món mặn"),
                }
            except (ValueError, KeyError):
                continue

    logger.info(f"  Loaded {len(dishes)} dishes from CSV")

    # --- Load nutrition values ---
    nutrition = {}
    with open(NUTRITION_TABLE_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

        # Skip unit row if present (first row with 'kcal' in energy)
        if rows and "kcal" in str(rows[0].get("energy", "")):
            rows = rows[1:]

        for row in rows:
            try:
                stt = int(row["stt"])
                nutrition[stt] = {
                    "energy": safe_float(row.get("energy")),
                    "protein": safe_float(row.get("protein")),
                    "fat": safe_float(row.get("fat")),
                    "carbohydrate": safe_float(row.get("carbohydrate")),
                    "vitamin_a": safe_float(row.get("vitamin_a")),
                    "beta_caroten": safe_float(row.get("beta_caroten")),
                    "vitamin_c": safe_float(row.get("vitamin_c")),
                    "calcium": safe_float(row.get("calcium")),
                    "iron": safe_float(row.get("iron")),
                    "zinc": safe_float(row.get("zinc")),
                    "sodium": safe_float(row.get("sodium")),
                    "cholesterol": safe_float(row.get("cholesterol")),
                    "magnesium": safe_float(row.get("magnesium")),
                    "transfat": safe_float(row.get("transfat")),
                }
            except (ValueError, KeyError):
                continue

    logger.info(f"  Loaded {len(nutrition)} nutrition records from CSV")

    # --- Merge and upsert ---
    db_rows = []
    for stt, dish in dishes.items():
        nutri = nutrition.get(stt, {})
        db_rows.append({
            "stt": stt,
            "dish_id": dish["dish_id"],
            "dish_name_vi": dish["dish_name_vi"],
            "dish_name_en": dish["dish_name_en"] or None,
            "dish_type": dish["dish_type"],
            "group_name_vi": dish["group_name_vi"] or None,
            "group_name_en": dish["group_name_en"] or None,
            "energy": nutri.get("energy", 0),
            "protein": nutri.get("protein", 0),
            "fat": nutri.get("fat", 0),
            "carbohydrate": nutri.get("carbohydrate", 0),
            "vitamin_a": nutri.get("vitamin_a", 0),
            "beta_caroten": nutri.get("beta_caroten", 0),
            "vitamin_c": nutri.get("vitamin_c", 0),
            "calcium": nutri.get("calcium", 0),
            "iron": nutri.get("iron", 0),
            "zinc": nutri.get("zinc", 0),
            "sodium": nutri.get("sodium", 0),
            "cholesterol": nutri.get("cholesterol", 0),
            "magnesium": nutri.get("magnesium", 0),
            "transfat": nutri.get("transfat", 0),
        })

    inserted = upsert_batch("nutrition_database", db_rows)
    logger.info(f"  ✅ nutrition_database: {inserted} rows seeded")


# ---------------------------------------------------------------------------
# 2. Seed nutrition_profiles (from profiles.json)
# ---------------------------------------------------------------------------

def seed_nutrition_profiles():
    """Load profiles.json → nutrition_profiles."""
    logger.info("=" * 60)
    logger.info("Seeding nutrition_profiles...")

    if not PROFILES_JSON.exists():
        logger.error(f"Profiles JSON not found: {PROFILES_JSON}")
        return

    with open(PROFILES_JSON, "r", encoding="utf-8") as f:
        profiles = json.load(f)

    logger.info(f"  Loaded {len(profiles)} profiles from JSON")

    db_rows = []
    for p in profiles:
        profile = p.get("profile", {})
        db_rows.append({
            "stt": p["stt"],
            "age_group": profile.get("Nhóm tuổi/Age group", ""),
            "gender": profile.get("Giới tính/Gender", ""),
            "labor_level": profile.get("Mức độ lao động/Labor Level", ""),
            "physiological_condition": profile.get(
                "Tình trạng sinh lý/Physiological condition", ""
            ),
        })

    inserted = upsert_batch("nutrition_profiles", db_rows)
    logger.info(f"  ✅ nutrition_profiles: {inserted} rows seeded")


# ---------------------------------------------------------------------------
# 3. Seed nutrition_recommendations (from recommendations/*.csv)
# ---------------------------------------------------------------------------

def seed_nutrition_recommendations():
    """Load recommendations/{stt}.csv → nutrition_recommendations."""
    logger.info("=" * 60)
    logger.info("Seeding nutrition_recommendations...")

    if not RECOMMENDATIONS_DIR.exists():
        logger.error(f"Recommendations dir not found: {RECOMMENDATIONS_DIR}")
        return

    # First, clear existing recommendations to avoid duplicates
    try:
        supabase.table("nutrition_recommendations").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        logger.info("  Cleared existing recommendations")
    except Exception as e:
        logger.warning(f"  Could not clear existing recommendations: {e}")

    csv_files = sorted(RECOMMENDATIONS_DIR.glob("*.csv"), key=lambda p: safe_int(p.stem))
    logger.info(f"  Found {len(csv_files)} recommendation files")

    all_rows = []
    for csv_file in csv_files:
        profile_stt = safe_int(csv_file.stem)
        if profile_stt == 0:
            continue

        try:
            with open(csv_file, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    name = row.get("Nhu cầu dinh dưỡng khuyến nghị", "")
                    value_str = row.get("Giá trị", "")
                    unit = row.get("Đơn vị tính", "")

                    if not value_str or value_str.strip() == "-":
                        continue

                    all_rows.append({
                        "profile_stt": profile_stt,
                        "nutrient_name": name.strip(),
                        "unit": unit.strip(),
                        "value_str": value_str.strip(),
                    })
        except Exception as e:
            logger.warning(f"  Failed to read {csv_file.name}: {e}")

    logger.info(f"  Total recommendation rows to insert: {len(all_rows)}")

    # Insert in batches (no upsert since no unique constraint besides id)
    inserted = 0
    for i in range(0, len(all_rows), BATCH_SIZE):
        batch = all_rows[i : i + BATCH_SIZE]
        try:
            supabase.table("nutrition_recommendations").insert(batch).execute()
            inserted += len(batch)
            if inserted % 500 == 0 or inserted == len(all_rows):
                logger.info(f"  nutrition_recommendations: {inserted}/{len(all_rows)}")
        except Exception as e:
            logger.error(f"  Batch {i}-{i+len(batch)} failed: {e}")

    logger.info(f"  ✅ nutrition_recommendations: {inserted} rows seeded")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    logger.info("🚀 Starting nutrition data seeding...")
    logger.info(f"   Supabase URL: {SUPABASE_URL}")
    logger.info(f"   Data source: {AGENTS_DIR}")

    # Check data directory exists
    if not AGENTS_DIR.exists():
        logger.error(f"Agent directory not found: {AGENTS_DIR}")
        sys.exit(1)

    seed_nutrition_database()
    seed_nutrition_profiles()
    seed_nutrition_recommendations()

    logger.info("=" * 60)
    logger.info("🎉 Seeding complete!")


if __name__ == "__main__":
    main()
