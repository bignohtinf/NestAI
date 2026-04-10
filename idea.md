# 🤰 AI20K-041 — Optimizing Nutrition for Pregnancy and Lactation

## 📌 Overview

AI20K-041 — Optimizing Nutrition for Pregnancy and Lactation là một AI Agent dinh dưỡng hỗ trợ phụ nữ mang thai và cho con bú tạo thực đơn cá nhân hóa theo từng giai đoạn cụ thể của thai kỳ và thời kỳ nuôi con.
Hệ thống cho phép nhập thông tin sức khỏe, tuổi thai, dị ứng thực phẩm, sở thích ăn uống và mục tiêu dinh dưỡng để tự động sinh thực đơn phù hợp.
AI đồng thời kiểm tra mức năng lượng, các nhóm chất và vi chất cần thiết nhằm giảm nguy cơ thiếu hoặc thừa dinh dưỡng.
Người dùng có thể chụp ảnh bữa ăn để hệ thống ước tính calo và gợi ý điều chỉnh trong ngày.

---

## 🎯 Vision & Mission

### Sứ mệnh
Tự động hóa quy trình lập thực đơn cho phụ nữ mang thai và cho con bú bằng AI, đảm bảo:
- Đủ dinh dưỡng theo chuẩn Bộ Y tế
- Cá nhân hóa theo từng giai đoạn thai kỳ và thể trạng
- Phù hợp sở thích, bệnh lý và điều kiện của từng người

### Tầm nhìn
Xây dựng nền tảng dinh dưỡng toàn diện có thể mở rộng cho các đối tượng đặc biệt khác (trẻ em, người cao tuổi, người mắc bệnh mãn tính), tạo hệ sinh thái dữ liệu dinh dưỡng cá nhân hóa tại Việt Nam.

---

## 🏗️ System Architecture

Hệ thống sử dụng mô hình 3-Tier Architecture:

### 1. Frontend — Next.js 14
- Giao diện người dùng thân thiện, hiện đại
- Responsive (Desktop + Mobile)
- Hỗ trợ PWA (offline)

### 2. Backend — FastAPI
- API trung tâm (Orchestrator)
- Xử lý logic nghiệp vụ
- Kết nối AI & Database

### 3. AI Core (Nutrition-Agent)

#### Google OR-Tools
- Giải bài toán tối ưu dinh dưỡng:
  - Cân bằng vi chất theo từng tam cá nguyệt
  - Kiểm soát kcal phù hợp mục tiêu cân nặng

#### LLM (OpenAI / Anthropic)
- Sinh thực đơn cá nhân hóa
- Gợi ý món thay thế khi có dị ứng hoặc không thích
- Tạo công thức nấu ăn đơn giản, dễ thực hiện
- Phân tích ảnh bữa ăn để ước tính calo

### 4. Database — Supabase (PostgreSQL)
- Lưu trữ tập trung
- Realtime sync
- Row Level Security (RLS)

---

## 🚀 Key Features

### A. Personalized Nutrition Planning

#### AI Menu Generator
- Input: giai đoạn thai kỳ / tuần tuổi thai, cân nặng, chiều cao, bệnh lý (tiểu đường thai kỳ, thiếu máu...), dị ứng thực phẩm, sở thích
- Output: thực đơn ngày/tuần cá nhân hóa
- Đảm bảo đủ:
  - Calories theo giai đoạn (tam cá nguyệt 1, 2, 3 / cho con bú)
  - Protein, sắt, canxi, axit folic, DHA
  - Chất xơ, vitamin nhóm B

#### Stage-Aware Adjustment
- Tự động điều chỉnh thực đơn khi người dùng chuyển giai đoạn thai kỳ
- Gợi ý thực phẩm ưu tiên và thực phẩm cần tránh theo từng giai đoạn

---

### B. Food Safety & Allergy Management

#### Allergy Tagging
- Đánh dấu dị ứng / không dung nạp thực phẩm:
  - Hải sản, gluten, sữa, đậu phộng...
- Lọc tự động khỏi thực đơn gợi ý

#### Condition-Based Filtering
- Chế độ ăn riêng cho từng tình trạng:
  - Tiểu đường thai kỳ: kiểm soát đường huyết, chỉ số GI thấp
  - Thiếu máu: ưu tiên thực phẩm giàu sắt và vitamin C
  - Tăng cân quá mức: kiểm soát calo, tăng chất xơ

---

### C. Meal Photo Analysis

#### Image-Based Calorie Estimator
- Người dùng chụp ảnh bữa ăn thực tế
- AI nhận diện món ăn và ước tính:
  - Tổng kcal
  - Thành phần dinh dưỡng chính (protein, carbs, chất béo)
- So sánh với mục tiêu trong ngày và gợi ý điều chỉnh bữa kế tiếp

---

### D. User-Centric Features

#### Cho người dùng cá nhân (Bà bầu / Mẹ cho con bú)
- Daily Nutrition Dashboard
  - Theo dõi lượng kcal và vi chất đã nạp trong ngày
  - Cảnh báo thiếu hụt vi chất quan trọng (sắt, canxi, DHA...)
- Weekly Meal Plan
  - Thực đơn đa dạng, không lặp lại trong tuần
  - Có thể tùy chỉnh, hoán đổi món
- Reminder & Check-in
  - Nhắc uống nước, bổ sung vitamin
  - Check-in bữa ăn hàng ngày để hệ thống học và cải thiện gợi ý

---

### E. Multi-Agent System (Advanced)

- **Nutrition Analyst Agent**
  - Phân tích lịch sử ăn uống
  - Phát hiện thiếu hụt vi chất kéo dài và cảnh báo

- **Menu Generator Agent**
  - Sinh thực đơn đa dạng, không lặp lại
  - Cân bằng dinh dưỡng theo chuẩn WHO / Bộ Y tế Việt Nam

- **Food Vision Agent**
  - Nhận diện món ăn từ ảnh
  - Ước tính khẩu phần và dinh dưỡng

- **Regulatory Compliance Agent**
  - Kiểm tra thực đơn theo khuyến nghị dinh dưỡng cho bà bầu
  - Cảnh báo thực phẩm không an toàn trong thai kỳ (thủy ngân cao, thực phẩm sống...)

---

## 💰 Business Model

| Thành phần | Chi tiết |
|---|---|
| Khách hàng mục tiêu | Phụ nữ mang thai và cho con bú |
| Vấn đề | Thiếu vi chất, tiểu đường thai kỳ, mất kiểm soát cân nặng do chế độ ăn thiếu cân bằng |
| Giải pháp | AI Agent tự động sinh thực đơn cá nhân hóa, tính kcal từ ảnh, theo dõi dinh dưỡng hàng ngày |
| Giá | $5/tháng (~120.000 VND) |
| Chi phí nếu không dùng | Rủi ro sức khỏe cho cả mẹ và bé |

---

## 🗄️ Database Schema

```sql
-- Pregnancy stage
CREATE TYPE pregnancy_stage AS ENUM (
  'trimester_1', 'trimester_2', 'trimester_3', 'breastfeeding'
);

-- Meal type
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- Menu status
CREATE TYPE menu_status AS ENUM ('draft', 'active');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pregnancy_stage pregnancy_stage NOT NULL,
  gestational_week INT,           -- tuần tuổi thai
  weight_kg NUMERIC,
  height_cm NUMERIC,
  conditions TEXT[] DEFAULT '{}', -- tiểu đường thai kỳ, thiếu máu...
  allergies TEXT[] DEFAULT '{}',
  food_preferences TEXT[] DEFAULT '{}',
  calorie_goal NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,             -- gram, ml
  -- Nutrition per 100g
  calories NUMERIC,
  protein NUMERIC,
  fat NUMERIC,
  carbs NUMERIC,
  fiber NUMERIC,
  iron NUMERIC,
  calcium NUMERIC,
  folate NUMERIC,
  dha NUMERIC,
  glycemic_index NUMERIC,
  allergens TEXT[] DEFAULT '{}',
  is_unsafe_pregnancy BOOLEAN DEFAULT FALSE  -- thực phẩm cần tránh khi mang thai
);

CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  recipe_metadata JSONB NOT NULL, -- nguyên liệu và định lượng
  meal_type meal_type,
  suitable_stages pregnancy_stage[] DEFAULT '{}'
);

CREATE TABLE weekly_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  pregnancy_stage pregnancy_stage,
  status menu_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE daily_menu_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_menu_id UUID REFERENCES weekly_menus(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type meal_type,
  dish_id UUID REFERENCES dishes(id),
  total_calories NUMERIC,
  total_protein NUMERIC,
  total_iron NUMERIC,
  total_calcium NUMERIC,
  notes TEXT
);

CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  meal_type meal_type,
  photo_url TEXT,                 -- ảnh bữa ăn
  estimated_calories NUMERIC,     -- ước tính từ AI
  estimated_nutrition JSONB,      -- chi tiết dinh dưỡng ước tính
  ai_suggestion TEXT              -- gợi ý điều chỉnh bữa kế tiếp
);

CREATE INDEX idx_health_profiles_user ON health_profiles(user_id);
CREATE INDEX idx_weekly_menus_user ON weekly_menus(user_id);
CREATE INDEX idx_meal_logs_user_date ON meal_logs(user_id, logged_at);
CREATE INDEX idx_ingredients_allergens ON ingredients USING GIN (allergens);

-- Enable RLS
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

-- Users chỉ truy cập dữ liệu của chính mình
CREATE POLICY "Users access own health profile"
ON health_profiles FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users access own menus"
ON weekly_menus FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Users access own meal logs"
ON meal_logs FOR ALL
USING (user_id = auth.uid());
```