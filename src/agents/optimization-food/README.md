# Optimization Food Agent

This agent is responsible for processing nutrition data and optimizing food recommendations for the NestAI platform. It follows the architectural pattern established in the `bot-pregnant` agent.

## Structure

```
optimization-food/
├── data/
│   ├── raw/                # Original data files
│   │   ├── dishes/         # raw_dish_table.csv, raw_nutrition_table.csv, images/
│   │   └── profiles/       # profiles.json, recommendations/*.csv
│   └── processed/          # Data prepared for the engine (TBD)
├── prompts/                # AI system prompts and templates
├── scripts/                # Utility scripts for data migration/processing
├── src/
│   ├── crawler/            # Data extraction logic (legacy migration)
│   ├── engine/             
│   │   └── optimizer.py    # Core CP-SAT optimization logic using Google OR-Tools
│   └── ingestion/          
│       └── loader.py       # Robust data loading for CSVs and JSON profiles
├── environment.yml         # Conda environment configuration (includes ortools)
└── requirements.txt        # Python dependencies
```

## Setup

1. **Create Environment:**
   ```bash
   conda env create -f environment.yml
   conda activate optimization-food
   ```
   *Or using pip:*
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Crawler Setup (Playwright):**
   The crawler uses Playwright for browser automation.
   - **Install Playwright Browsers:**
     ```bash
     playwright install chromium
     ```

## Usage

### Crawler
To crawl nutritional data and recommendation profiles:
```bash
# Crawl dish and nutrition data
python -m src.crawler.dishes

# Crawl nutritional recommendation profiles
python -m src.crawler.profiles
```

### Data Ingestion
To process raw data into refined formats:
```bash
python -m src.ingestion.cleaner
```

### Optimization Engine
The core logic resides in `src.engine.optimizer`. It uses the Google OR-Tools CP-SAT solver to find valid meal combinations based on a user's nutritional requirements.

```python
from src.engine.optimizer import recommend_meals
from src.ingestion.loader import get_user_profiles

# Get a sample profile
profiles = get_user_profiles()
user_profile = profiles[0]

# Generate meal recommendations
combinations = recommend_meals(user_profile, excluded_dishes=[])
print(combinations)
```

## Features
- ✅ **Nutrition Analysis:** Processes raw nutrition tables for over 1,200 dishes.
- ✅ **Constraint Satisfaction:** Uses `ortools` to solve complex multi-nutrient requirements (Energy, Protein, Fat, Carbs).
- ✅ **Personalized Recommendations:** Maps health profiles to specific nutritional thresholds based on age, gender, and activity level.
- ✅ **Modular Architecture:** Separated data loading (`ingestion`) from solving logic (`engine`).
