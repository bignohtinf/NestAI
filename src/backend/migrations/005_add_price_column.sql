-- ============================================================================
-- Migration 005: Add Price Column to nutrition_database
-- Thêm trường giá tiền (VNĐ) cho từng món ăn để hỗ trợ tối ưu ngân sách
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Thêm cột price_vnd vào bảng nutrition_database
--    Giá tính theo VNĐ/phần (100g serving mặc định)
--    NULL = chưa có giá → optimizer bỏ qua ràng buộc giá cho món đó
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.nutrition_database
  ADD COLUMN IF NOT EXISTS price_vnd numeric DEFAULT NULL;

COMMENT ON COLUMN public.nutrition_database.price_vnd 
  IS 'Giá tiền VNĐ/phần (per serving_size). NULL = chưa cập nhật giá';

-- Index cho query tìm theo khoảng giá
CREATE INDEX IF NOT EXISTS idx_nutrition_database_price 
  ON public.nutrition_database(price_vnd) 
  WHERE price_vnd IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Thêm cột budget vào bảng meal_plans (tùy chọn)
--    Lưu ngân sách user đã đặt khi tạo meal plan
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.meal_plans
  ADD COLUMN IF NOT EXISTS daily_budget_vnd numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS breakfast_budget_vnd numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lunch_budget_vnd numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS dinner_budget_vnd numeric DEFAULT NULL;

COMMENT ON COLUMN public.meal_plans.daily_budget_vnd 
  IS 'Ngân sách cả ngày (VNĐ). Nếu set thì chia theo tỷ lệ bữa ăn';
COMMENT ON COLUMN public.meal_plans.breakfast_budget_vnd 
  IS 'Ngân sách bữa sáng (VNĐ). Override tỷ lệ nếu set riêng';
COMMENT ON COLUMN public.meal_plans.lunch_budget_vnd 
  IS 'Ngân sách bữa trưa (VNĐ). Override tỷ lệ nếu set riêng';
COMMENT ON COLUMN public.meal_plans.dinner_budget_vnd 
  IS 'Ngân sách bữa tối (VNĐ). Override tỷ lệ nếu set riêng';


-- ────────────────────────────────────────────────────────────────────────────
-- 3. (Tùy chọn) Cập nhật giá mẫu cho một số món phổ biến
--    Admin có thể cập nhật thêm qua API hoặc bulk upload
-- ────────────────────────────────────────────────────────────────────────────

-- Ví dụ giá mẫu (có thể chạy riêng hoặc bỏ qua):
-- UPDATE public.nutrition_database SET price_vnd = 15000 WHERE dish_type = 'món tinh bột';
-- UPDATE public.nutrition_database SET price_vnd = 25000 WHERE dish_type = 'món mặn';
-- UPDATE public.nutrition_database SET price_vnd = 15000 WHERE dish_type = 'món rau';
-- UPDATE public.nutrition_database SET price_vnd = 12000 WHERE dish_type = 'món canh';
-- UPDATE public.nutrition_database SET price_vnd = 10000 WHERE dish_type = 'tráng miệng';
