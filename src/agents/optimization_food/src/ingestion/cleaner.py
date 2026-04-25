"""
cleaner.py
Processes raw nutrition data and profiles into refined formats for the optimization engine.
"""

import pandas as pd
import json
import logging
from pathlib import Path

# ---------------------------------------------------------------------------
# Path Constants
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
PROC_DIR = DATA_DIR / "processed"

DISHES_RAW = RAW_DIR / "dishes"
PROFILES_RAW = RAW_DIR / "profiles"

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def clean_nutrition_table():
    """Cleans the raw nutrition table and saves it to the processed directory."""
    raw_file = DISHES_RAW / "raw_nutrition_table.csv"
    if not raw_file.exists():
        logger.warning(f"Raw nutrition table not found at {raw_file}")
        return

    logger.info(f"Cleaning nutrition table: {raw_file}")
    
    # Read CSV, skip unit row
    df = pd.read_csv(raw_file)
    
    # If the first row contains units (e.g., 'kcal'), drop it
    if 'kcal' in str(df.iloc[0].get('energy', '')):
        df = df.iloc[1:].reset_index(drop=True)

    # Convert numeric columns, handling comma decimals
    numeric_cols = [
        "energy", "protein", "fat", "carbohydrate", "vitamin_a", "beta_caroten",
        "vitamin_c", "calcium", "iron", "zinc", "sodium", "cholesterol", 
        "magnesium", "transfat"
    ]
    
    for col in numeric_cols:
        if col in df.columns:
            # Replace comma with dot and convert to float
            df[col] = df[col].astype(str).str.replace(',', '.').pipe(pd.to_numeric, errors='coerce').fillna(0.0)

    # Save to processed
    PROC_DIR.mkdir(parents=True, exist_ok=True)
    out_file = PROC_DIR / "nutrition_cleaned.csv"
    df.to_csv(out_file, index=False)
    logger.info(f"Saved cleaned nutrition table to {out_file}")

def clean_dish_table():
    """Cleans the raw dish table and saves it to the processed directory."""
    raw_file = DISHES_RAW / "raw_dish_table.csv"
    if not raw_file.exists():
        logger.warning(f"Raw dish table not found at {raw_file}")
        return

    logger.info(f"Cleaning dish table: {raw_file}")
    df = pd.read_csv(raw_file)
    
    # Basic cleaning
    df = df.dropna(subset=['stt', 'dish_name_vietnamese'])
    
    # Save to processed
    PROC_DIR.mkdir(parents=True, exist_ok=True)
    out_file = PROC_DIR / "dishes_cleaned.csv"
    df.to_csv(out_file, index=False)
    logger.info(f"Saved cleaned dish table to {out_file}")

def run_cleaning():
    """Runs all cleaning tasks."""
    logger.info("Starting data ingestion cleaning process...")
    clean_nutrition_table()
    clean_dish_table()
    logger.info("Data ingestion cleaning completed.")

if __name__ == "__main__":
    run_cleaning()
