# 🍱 AI20K-041 — School Nutrition Optimizer

## 📌 Overview

AI20K-041 — School Nutrition Optimizer là hệ thống tối ưu hóa thực đơn bán trú cho trường học, sử dụng dữ liệu và AI để giải quyết bài toán:

- Cân bằng Dinh dưỡng
- Tối ưu Ngân sách
- Cá nhân hóa theo dị ứng & khẩu vị
- Giảm thiểu lãng phí thực phẩm

Hệ thống được thiết kế cho quy mô ~800 học sinh (K-12), hướng tới thay thế phương pháp lập thực đơn thủ công bằng nền tảng tự động, thông minh.

---

## 🎯 Vision & Mission

### Sứ mệnh
Tự động hóa quy trình lập thực đơn học đường bằng AI, đảm bảo:
- Đủ dinh dưỡng theo chuẩn
- Tối ưu chi phí
- Phù hợp với từng học sinh

### Tầm nhìn
Xây dựng nền tảng có thể mở rộng cho nhiều trường học, tạo hệ sinh thái dữ liệu dinh dưỡng.

---

## 🏗️ System Architecture

Hệ thống sử dụng mô hình 3-Tier Architecture:

### 1. Frontend — Next.js 14
- Dashboard quản trị hiện đại
- Responsive (Desktop + Mobile)
- Hỗ trợ PWA (offline)

### 2. Backend — FastAPI
- API trung tâm (Orchestrator)
- Xử lý logic nghiệp vụ
- Kết nối AI & Database

### 3. AI Core (Optimizer-Agent)

#### Google OR-Tools
- Giải bài toán tối ưu:
  - Dinh dưỡng
  - Chi phí

#### LLM (OpenAI / Anthropic)
- Sinh thực đơn
- Gợi ý món thay thế
- Tạo công thức nấu ăn

### 4. Database — Supabase (PostgreSQL)
- Lưu trữ tập trung
- Realtime sync
- Row Level Security (RLS)

---

## 🚀 Key Features

### A. Nutrition & Budget Optimization

#### AI Menu Generator
- Input: ngân sách/ngày
- Output: thực đơn tự động
- Đảm bảo:
  - Calories
  - Protein
  - Chất xơ

#### Smart Inventory
- Theo dõi kho nguyên liệu
- Cảnh báo thiếu hụt
- Hỗ trợ lập kế hoạch tuần

---

### B. Personalization & Food Safety

#### Allergy Tagging
- Gắn tag dị ứng cho:
  - Học sinh
  - Nguyên liệu

#### Sub-Menu Logic
- Tạo thực đơn phụ:
  - Ví dụ: không hải sản
- Áp dụng cho ~15% học sinh
- Vẫn đảm bảo ngân sách

---

### C. Waste Tracking & Feedback Loop (NEW)

#### Waste Logging
Nhân viên bếp ghi nhận sau mỗi bữa ăn:

- Mức độ thức ăn thừa (% hoặc kg)
- Lý do:
  - Không hợp khẩu vị
  - Nấu quá nhiều
  - Món khó ăn
- Ảnh minh chứng (optional)

Giao diện tối ưu cho mobile, thao tác nhanh.

---

### D. User-Centric Features (NEW)
#### A. Cho Nhân viên bếp (Efficiency)
- Smart Inventory Auto-Sync
    - Tự động trừ kho khi thực đơn được duyệt
    - Cảnh báo thiếu nguyên liệu ngay lập tức
- Cooking Guide Generation
    - AI sinh công thức nấu ăn quy mô lớn
    - Ví dụ: 800 suất với định lượng chuẩn
- Offline Mode (PWA)
    - Xem thực đơn khi mất mạng
    - Phù hợp môi trường bếp
#### B. Cho Nhà quản lý / Hiệu trưởng (Transparency & Cost)
- Budget Heatmap
    - Biểu đồ biến động giá thực phẩm theo thời gian
    - Hỗ trợ điều chỉnh ngân sách
- One-Touch Approval
    - Gửi thông báo qua Telegram/Zalo
    - Duyệt thực đơn ngay trên điện thoại
#### C. Cho Phụ huynh (Trust)
- Public Nutrition Portal
    - Xem thực đơn không cần đăng nhập
    - Có thể kèm ảnh thực tế từ bếp
- Feedback Loop
    - Đánh giá món ăn (rating/comment)
    - AI học khẩu vị học sinh
### E. Role-Based Operations
#### Multi-Agent System (Advanced)
- Analyst Agent
    - Phân tích dữ liệu lịch sử & waste
    - Giảm tần suất món bị bỏ thừa
- Market Intelligence Agent
    - Cập nhật giá thực phẩm thị trường
    - Dự báo ngân sách chính xác hơn
- Regulatory Compliance Agent
    -Kiểm tra tuân thủ quy định:
        -Đường
        - Muối
        - Chất béo
- Recipe Agent
    - Sinh công thức nấu ăn quy mô lớn
#### Parent & Community Experience
- Public Portal
    - Quét QR để xem:
        - Thực đơn
        - Dinh dưỡng
        - Nguồn gốc thực phẩm
- Feedback System
    - Phụ huynh đánh giá món ăn
    - AI học khẩu vị → giảm waste

#### Database Schema

```sql
-- User role
CREATE TYPE user_role AS ENUM ('admin', 'staff');

-- Meal type
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'snack');

-- Menu status
CREATE TYPE menu_status AS ENUM ('draft', 'approved');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  role user_role DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- kg, gram, ml
  price_per_unit NUMERIC NOT NULL,
  
  -- Nutrition (per 100g)
  calories NUMERIC,
  protein NUMERIC,
  fat NUMERIC,
  carbs NUMERIC,
  fiber NUMERIC,

  allergens TEXT[] DEFAULT '{}'
);

CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  recipe_metadata JSONB NOT NULL, -- định mức nguyên liệu
  category meal_type
);

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade_level TEXT,
  allergies TEXT[] DEFAULT '{}',
  is_special_diet BOOLEAN DEFAULT FALSE
);

CREATE TABLE weekly_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  status menu_status DEFAULT 'draft',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE daily_menu_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_menu_id UUID REFERENCES weekly_menus(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type meal_type,
  dish_id UUID REFERENCES dishes(id),

  total_calculated_calories NUMERIC,
  total_cost NUMERIC,

  allergy_notes TEXT
);

CREATE INDEX idx_ingredients_allergens ON ingredients USING GIN (allergens);
CREATE INDEX idx_students_allergies ON students USING GIN (allergies);

CREATE INDEX idx_menu_date ON daily_menu_details(date);
CREATE INDEX idx_weekly_menu_start_date ON weekly_menus(start_date);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_menu_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;

-- Staff chỉ đọc profile
CREATE POLICY "Staff can view profiles"
ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');

-- Staff update menu detail
CREATE POLICY "Staff update menu"
ON daily_menu_details
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access"
ON weekly_menus
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

Table: waste_logs
- id (uuid, PK)
- daily_menu_detail_id (uuid, FK)
- leftover_quantity (numeric)
- waste_reason (text)
- recorded_by (uuid, FK profiles)
- recorded_at (timestamp)