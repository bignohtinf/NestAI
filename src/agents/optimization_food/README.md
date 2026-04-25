# Optimization Food Agent

This agent is responsible for processing nutrition data and optimizing food recommendations for the NestAI platform. It utilizes constraint satisfaction programming to generate balanced meal plans.

## Structure

```
optimization_food/
├── data/
│   ├── raw/                # Original data files from crawlers
│   │   ├── dishes/         # raw_dish_table.csv, raw_nutrition_table.csv, images/
│   │   └── profiles/       # profiles.json, recommendations/*.csv
│   └── processed/          # Cleaned data (nutrition_cleaned.csv, dishes_cleaned.csv)
├── prompts/                # AI system prompts and templates
├── scripts/                # Utility scripts for data migration/processing
├── src/
│   ├── crawler/            # Playwright-based Vietnamese nutritional data scrapers
│   ├── engine/             
│   │   └── optimizer.py    # Core CP-SAT optimization logic using Google OR-Tools
│   └── ingestion/          
│       ├── cleaner.py      # Data cleaning and normalization logic
│       └── loader.py       # Robust data loading for CSVs and JSON profiles
├── environment.yml         # Conda environment configuration
└── requirements.txt        # Python dependencies
```

## Setup

1. **Create Environment:**
   ```bash
   conda env create -f environment.yml
   conda activate optimization_food
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
# Scrape dish information and nutrition tables
python -m src.crawler.dishes

# Scrape nutritional recommendation profiles (170+ profiles)
python -m src.crawler.profiles
```

### Data Ingestion
To process raw data into refined formats for the engine:
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

# Generate meal recommendations (returns lists of dish STTs)
combinations = recommend_meals(user_profile, excluded_dishes=[])
print(combinations)
```

## Features
- ✅ **Nutrition Analysis:** Processes raw nutrition tables for over 1,200 Vietnamese dishes.
- ✅ **Constraint Satisfaction:** Uses `ortools` to solve complex multi-nutrient requirements (Energy, Protein, Fat, Carbs).
- ✅ **Personalized Recommendations:** Maps health profiles to specific nutritional thresholds based on age, gender, and activity level.
- ✅ **Cleaned Data Pipeline:** Automated cleaning of raw CSVs into normalized formats.
- ✅ **Web Integration:** Exposes recommendation logic via FastAPI endpoints in the main backend.

## 📊 Dish Data EDA Report

### 1. Tổng quan (General Overview)
- **Tổng số món ăn:** 1250
- **Số lượng nhóm món ăn:** 19
- **Số lượng cột dữ liệu:** 6

### 2. Phân bố Nhóm món ăn (Top 10 Groups)
| Nhóm món ăn | Số lượng |
| :--- | :--- |
| Các món khác | 323 |
| Các loại bánh | 166 |
| Bánh đa, bún, phở | 136 |
| Bánh canh, bánh đa, bún, cháo, súp, hoành thánh, hủ tiếu, miến, mỳ, phở, lẩu | 119 |
| Cơm, cháo, xôi | 119 |
| Chè, các loại giải khát | 88 |
| Các món bánh, kẹo | 62 |
| Bún, cơm, xôi, cháo | 49 |
| Các loại trái cây | 33 |
| Các món xôi, chè | 26 |

### 3. Phân bố Loại món ăn (Dish Types)
| Loại món ăn | Số lượng |
| :--- | :--- |
| món tinh bột | 429 |
| món mặn | 420 |
| tráng miệng | 288 |
| món rau | 88 |
| món canh | 25 |

### 4. Kiểm tra Dữ liệu thiếu (Missing Values)
- **STT:** 0
- **ID:** 0
- **Tên món (VN):** 0
- **Tên món (EN):** 0

### 5. Thống kê Dinh dưỡng (Nutrition Insights)
- **Năng lượng trung bình (Energy avg):** 24.75 kcal / 100g
- **Món ăn giàu năng lượng nhất:** N/A (615.00 kcal)

### 6. Kết luận sơ bộ
- Dữ liệu món ăn đa dạng với 1250 mục.
- Các nhóm món ăn phổ biến nhất là 'Các món khác' và 'Các loại bánh'.
- Dữ liệu sạch, hầu như không có giá trị thiếu trong các cột quan trọng.
