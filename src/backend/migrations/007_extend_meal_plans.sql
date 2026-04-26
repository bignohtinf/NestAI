-- ============================================================================
-- Migration 007: Extend meal_plans for full plan storage
-- Thêm cột để lưu toàn bộ plan data (JSON), nutrition summary, target
-- ============================================================================

-- Target: mother or baby
ALTER TABLE public.meal_plans
  ADD COLUMN IF NOT EXISTS target VARCHAR(20) DEFAULT 'mother'
    CHECK (target IN ('mother', 'baby'));

-- Full plan data as JSON (alternative to meal_plan_items for quick retrieval)
ALTER TABLE public.meal_plans
  ADD COLUMN IF NOT EXISTS plan_data JSONB DEFAULT '{}';

-- Nutrition summary per meal + total
ALTER TABLE public.meal_plans
  ADD COLUMN IF NOT EXISTS nutrition_summary JSONB DEFAULT NULL;

-- Estimated cost per meal + total
ALTER TABLE public.meal_plans
  ADD COLUMN IF NOT EXISTS estimated_cost JSONB DEFAULT NULL;

COMMENT ON COLUMN public.meal_plans.target IS 'Thực đơn cho ai: mother hoặc baby';
COMMENT ON COLUMN public.meal_plans.plan_data IS 'Full plan data JSON: {breakfast: {...}, lunch: {...}, dinner: {...}}';
COMMENT ON COLUMN public.meal_plans.nutrition_summary IS 'Tổng dinh dưỡng: {breakfast: {...}, lunch: {...}, dinner: {...}, total: {...}}';
COMMENT ON COLUMN public.meal_plans.estimated_cost IS 'Chi phí ước tính: {breakfast: N, lunch: N, dinner: N, total: N}';

-- Unique constraint: one plan per user per date per target
-- (allows separate plans for mother and baby on same day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plans_user_date_target
  ON public.meal_plans(user_id, plan_date, target);
