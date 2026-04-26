-- ============================================================================
-- Migration 004: Nutrition Optimization Integration
-- Sửa đổi schema cho tích hợp optimization_food agent với Supabase
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. DROP & RECREATE nutrition_database (vì bảng cũ thiếu quá nhiều cột)
--    Nếu bảng đã có data muốn giữ, dùng ALTER thay thế (xem cuối file)
-- ────────────────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS public.nutrition_database CASCADE;

CREATE TABLE public.nutrition_database (
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  -- ─── Identifier (KEY cho optimizer) ───
  stt integer NOT NULL UNIQUE,              -- Số thứ tự từ viendinhduong.vn (1-1250)
  dish_id character varying,                -- Mã món gốc (VD: "MA001")

  -- ─── Tên món ───
  dish_name_vi character varying NOT NULL,  -- Tên tiếng Việt
  dish_name_en character varying,           -- Tên tiếng Anh

  -- ─── Phân loại ───
  dish_type character varying NOT NULL,     -- 'món mặn' | 'món rau' | 'món tinh bột' | 'món canh' | 'tráng miệng'
  group_name_vi character varying,          -- Nhóm món VN (Các loại bánh, Cơm cháo xôi, ...)
  group_name_en character varying,          -- Nhóm món EN

  -- ─── Dinh dưỡng chính (per 100g) — dùng bởi optimizer ───
  energy numeric NOT NULL DEFAULT 0,        -- kcal
  protein numeric NOT NULL DEFAULT 0,       -- g
  fat numeric NOT NULL DEFAULT 0,           -- g
  carbohydrate numeric NOT NULL DEFAULT 0,  -- g

  -- ─── Vi chất (per 100g) — mở rộng optimizer sau ───
  vitamin_a numeric DEFAULT 0,              -- mcg
  beta_caroten numeric DEFAULT 0,           -- mcg
  vitamin_c numeric DEFAULT 0,              -- mg
  calcium numeric DEFAULT 0,               -- mg
  iron numeric DEFAULT 0,                  -- mg
  zinc numeric DEFAULT 0,                  -- mg
  sodium numeric DEFAULT 0,                -- mg
  cholesterol numeric DEFAULT 0,            -- mg
  magnesium numeric DEFAULT 0,              -- mg
  transfat numeric DEFAULT 0,               -- mg

  -- ─── Metadata ───
  serving_size numeric DEFAULT 100,         -- gram
  unit character varying DEFAULT 'g',
  image_url character varying,              -- URL ảnh món ăn (nếu có)
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT nutrition_database_pkey PRIMARY KEY (id)
);

-- Index cho optimizer query performance
CREATE INDEX idx_nutrition_database_stt ON public.nutrition_database(stt);
CREATE INDEX idx_nutrition_database_dish_type ON public.nutrition_database(dish_type);

COMMENT ON TABLE public.nutrition_database IS 'Bảng 1250 món ăn Việt Nam từ viendinhduong.vn. Seed từ raw_dish_table.csv + raw_nutrition_table.csv';
COMMENT ON COLUMN public.nutrition_database.stt IS 'Key chính của optimizer CP-SAT. JOIN key giữa dish table và nutrition table';
COMMENT ON COLUMN public.nutrition_database.dish_type IS 'Loại món — optimizer dùng để enforce ràng buộc cấu trúc bữa ăn';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Bảng hồ sơ dinh dưỡng (170+ profiles từ viendinhduong.vn)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.nutrition_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stt integer NOT NULL UNIQUE,                          -- Profile STT (1-170+)
  age_group character varying,                          -- "Nhóm tuổi" VD: "19 - 30 tuổi"
  gender character varying,                             -- "Giới tính" VD: "Nam", "Nữ"
  labor_level character varying,                        -- "Mức độ lao động" VD: "Lao động nhẹ"
  physiological_condition character varying,             -- "Tình trạng sinh lý" VD: "Phụ nữ có thai 3 tháng đầu"
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT nutrition_profiles_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_nutrition_profiles_stt ON public.nutrition_profiles(stt);
CREATE INDEX idx_nutrition_profiles_condition ON public.nutrition_profiles(physiological_condition);

COMMENT ON TABLE public.nutrition_profiles IS 'Hồ sơ dinh dưỡng khuyến nghị theo nhóm tuổi/giới tính/sinh lý. Seed từ profiles.json';

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Bảng khuyến nghị dinh dưỡng per profile
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.nutrition_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_stt integer NOT NULL,                         -- FK → nutrition_profiles.stt
  nutrient_name character varying NOT NULL,              -- VD: "Năng lượng", "Chất đạm"
  unit character varying,                               -- VD: "kcal", "g", "mg"
  value_str character varying NOT NULL,                  -- VD: "550.0 - 650.0" (range hoặc single)
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT nutrition_recommendations_pkey PRIMARY KEY (id),
  CONSTRAINT nutrition_recommendations_profile_fkey FOREIGN KEY (profile_stt)
    REFERENCES public.nutrition_profiles(stt) ON DELETE CASCADE
);

CREATE INDEX idx_nutrition_recommendations_profile ON public.nutrition_recommendations(profile_stt);

COMMENT ON TABLE public.nutrition_recommendations IS 'Nhu cầu dinh dưỡng khuyến nghị per profile. Seed từ recommendations/*.csv';

-- ────────────────────────────────────────────────────────────────────────────
-- 4. ALTER nutrition_logs — thêm meal_type và source
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.nutrition_logs
  ADD COLUMN IF NOT EXISTS meal_type character varying
    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  ADD COLUMN IF NOT EXISTS source character varying DEFAULT 'manual'
    CHECK (source IN ('manual', 'ai_recommendation', 'smart_scan'));

COMMENT ON COLUMN public.nutrition_logs.meal_type IS 'Loại bữa ăn: breakfast, lunch, dinner, snack';
COMMENT ON COLUMN public.nutrition_logs.source IS 'Nguồn nhập: manual, ai_recommendation (từ optimizer), smart_scan (từ camera)';

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Bảng chi tiết món ăn trong mỗi nutrition log
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.nutrition_log_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  log_id uuid NOT NULL,
  dish_stt integer NOT NULL,                            -- FK → nutrition_database.stt
  servings numeric DEFAULT 1,                           -- Số phần ăn (1 = 100g)
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT nutrition_log_items_pkey PRIMARY KEY (id),
  CONSTRAINT nutrition_log_items_log_fkey FOREIGN KEY (log_id)
    REFERENCES public.nutrition_logs(id) ON DELETE CASCADE,
  CONSTRAINT nutrition_log_items_dish_fkey FOREIGN KEY (dish_stt)
    REFERENCES public.nutrition_database(stt) ON DELETE CASCADE
);

CREATE INDEX idx_nutrition_log_items_log ON public.nutrition_log_items(log_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Bảng meal plans (lưu thực đơn AI sinh ra)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_date date NOT NULL DEFAULT CURRENT_DATE,
  profile_stt integer,                                  -- Profile dinh dưỡng đã dùng
  status character varying DEFAULT 'generated'
    CHECK (status IN ('generated', 'accepted', 'completed', 'dismissed')),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT meal_plans_pkey PRIMARY KEY (id),
  CONSTRAINT meal_plans_user_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT meal_plans_profile_fkey FOREIGN KEY (profile_stt)
    REFERENCES public.nutrition_profiles(stt)
);

CREATE INDEX idx_meal_plans_user_date ON public.meal_plans(user_id, plan_date);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Bảng chi tiết món trong meal plan
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  meal_type character varying NOT NULL                  -- 'breakfast' | 'lunch' | 'dinner'
    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  dish_stt integer NOT NULL,                            -- FK → nutrition_database.stt
  is_locked boolean DEFAULT false,                      -- User đã khóa món này

  CONSTRAINT meal_plan_items_pkey PRIMARY KEY (id),
  CONSTRAINT meal_plan_items_plan_fkey FOREIGN KEY (plan_id)
    REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  CONSTRAINT meal_plan_items_dish_fkey FOREIGN KEY (dish_stt)
    REFERENCES public.nutrition_database(stt) ON DELETE CASCADE
);

CREATE INDEX idx_meal_plan_items_plan ON public.meal_plan_items(plan_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. RLS Policies (bảo mật row-level cho Supabase)
-- ────────────────────────────────────────────────────────────────────────────

-- nutrition_database: public read, admin write
ALTER TABLE public.nutrition_database ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_database_read" ON public.nutrition_database FOR SELECT USING (true);

-- nutrition_profiles: public read
ALTER TABLE public.nutrition_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_profiles_read" ON public.nutrition_profiles FOR SELECT USING (true);

-- nutrition_recommendations: public read
ALTER TABLE public.nutrition_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_recommendations_read" ON public.nutrition_recommendations FOR SELECT USING (true);

-- meal_plans: user can only see their own
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_plans_own" ON public.meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- meal_plan_items: via plan ownership
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_plan_items_via_plan" ON public.meal_plan_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.meal_plans WHERE id = meal_plan_items.plan_id AND user_id = auth.uid())
  );

-- nutrition_log_items: via log ownership
ALTER TABLE public.nutrition_log_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nutrition_log_items_via_log" ON public.nutrition_log_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.nutrition_logs WHERE id = nutrition_log_items.log_id AND user_id = auth.uid())
  );
