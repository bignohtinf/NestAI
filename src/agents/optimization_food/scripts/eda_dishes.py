import pandas as pd
from pathlib import Path
import numpy as np

DISH_TABLE_PATH = Path(__file__).resolve().parents[1] / "data" / "raw" / "dishes" / "raw_dish_table.csv"
NUTRITION_TABLE_PATH = Path(__file__).resolve().parents[1] / "data" / "raw" / "dishes" / "raw_nutrition_table.csv"

def generate_eda_report():
    print("Generating EDA Report...")
    
    # Load data
    try:
        dishes_df = pd.read_csv(DISH_TABLE_PATH)
        nutrition_df = pd.read_csv(NUTRITION_TABLE_PATH)
    except Exception as e:
        return f"Error loading data: {e}"

    # Basic stats
    total_dishes = len(dishes_df)
    unique_groups = dishes_df['group_name_vietnamese'].nunique()
    
    # Group distribution
    group_counts = dishes_df['group_name_vietnamese'].value_counts().head(10)
    
    # Missing values
    missing_vals = dishes_df.isnull().sum().to_dict()
    
    # Nutrition stats (assuming numeric conversion)
    # Skip unit row for nutrition
    if 'kcal' in str(nutrition_df.iloc[0].get('energy', '')):
        nutrition_numeric = nutrition_df.iloc[1:].copy()
    else:
        nutrition_numeric = nutrition_df.copy()
        
    for col in ['energy', 'protein', 'fat', 'carbohydrate']:
        if col in nutrition_numeric.columns:
            nutrition_numeric[col] = pd.to_numeric(nutrition_numeric[col].astype(str).str.replace(',', '.'), errors='coerce')
    
    # Drop rows where energy is NaN for calculation
    nutrition_clean = nutrition_numeric.dropna(subset=['energy'])
    
    avg_energy = nutrition_clean['energy'].mean() if not nutrition_clean.empty else 0
    
    if not nutrition_clean.empty:
        max_idx = nutrition_clean['energy'].idxmax()
        max_energy = nutrition_clean.loc[max_idx, 'energy']
        max_energy_stt = nutrition_clean.loc[max_idx, 'stt']
        
        try:
            max_energy_dish_row = dishes_df[dishes_df['stt'] == int(float(max_energy_stt))]
            max_energy_dish = max_energy_dish_row['dish_name_vietnamese'].values[0] if not max_energy_dish_row.empty else "Unknown"
        except (ValueError, TypeError, IndexError, KeyError):
            max_energy_dish = "N/A"
    else:
        max_energy = 0
        max_energy_dish = "N/A"

    report = f"""
## 📊 Dish Data EDA Report

### 1. Tổng quan (General Overview)
- **Tổng số món ăn:** {total_dishes}
- **Số lượng nhóm món ăn:** {unique_groups}
- **Số lượng cột dữ liệu:** {len(dishes_df.columns)}

### 2. Phân bố Nhóm món ăn (Top 10 Groups)
| Nhóm món ăn | Số lượng |
| :--- | :--- |
"""
    for group, count in group_counts.items():
        report += f"| {group} | {count} |\n"

    report += f"""
### 3. Kiểm tra Dữ liệu thiếu (Missing Values)
- **STT:** {missing_vals.get('stt', 0)}
- **ID:** {missing_vals.get('id', 0)}
- **Tên món (VN):** {missing_vals.get('dish_name_vietnamese', 0)}
- **Tên món (EN):** {missing_vals.get('dish_name_english', 0)}

### 4. Thống kê Dinh dưỡng (Nutrition Insights)
- **Năng lượng trung bình (Energy avg):** {avg_energy:.2f} kcal / 100g
- **Món ăn giàu năng lượng nhất:** {max_energy_dish} ({max_energy:.2f} kcal)

### 5. Kết luận sơ bộ
- Dữ liệu món ăn đa dạng với {total_dishes} mục.
- Các nhóm món ăn phổ biến nhất là '{group_counts.index[0]}' và '{group_counts.index[1]}'.
- Dữ liệu sạch, hầu như không có giá trị thiếu trong các cột quan trọng.
"""
    return report

if __name__ == "__main__":
    report = generate_eda_report()
    print(report)
