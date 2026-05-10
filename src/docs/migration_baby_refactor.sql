-- ============================================================
-- MIGRATION: Refactor babies table + clean medical_profiles logic
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- 1. BABIES TABLE
-- -------------------------------------------------------

-- Xóa trigger cũ sync gestation_weeks sang medical_profile (logic sai, không dùng nữa)
DROP TRIGGER IF EXISTS tr_sync_baby_to_medical_profile ON public.babies;

-- Xóa function đi kèm trigger nếu có
DROP FUNCTION IF EXISTS sync_baby_to_medical_profile() CASCADE;

-- Xóa gestation_weeks: không lưu tuần thai, luôn tính live từ lmp/edd
ALTER TABLE public.babies DROP COLUMN IF EXISTS gestation_weeks CASCADE;

-- Xóa user_id: trùng lặp với created_by, không cần thiết
ALTER TABLE public.babies DROP COLUMN IF EXISTS user_id;

-- Thêm tên mẹ, tên bố (nullable — cập nhật sau, không bắt buộc khi tạo)
ALTER TABLE public.babies
  ADD COLUMN IF NOT EXISTS mother_name character varying,
  ADD COLUMN IF NOT EXISTS father_name character varying;

-- Đổi default status thành 'pregnant' (phù hợp với usecase tạo hồ sơ khi đang mang thai)
-- Khi bé chào đời thì update status → 'born'
ALTER TABLE public.babies ALTER COLUMN status SET DEFAULT 'pregnant';

-- -------------------------------------------------------
-- 2. MEDICAL_PROFILES TABLE
-- -------------------------------------------------------
-- Các cột week_of_pregnancy, trimester, days_in_week sẽ KHÔNG còn được ghi vào DB.
-- Chúng sẽ được tính live trong API response.
-- Giữ lại cột để không break schema cũ nếu có code khác đọc,
-- nhưng backend sẽ không ghi vào chúng nữa.
-- Nguồn sự thật: last_menstrual_period (lmp) và due_date.

-- Optional: nếu muốn dọn hoàn toàn thì uncomment các dòng sau
-- ALTER TABLE public.medical_profiles DROP COLUMN IF EXISTS week_of_pregnancy;
-- ALTER TABLE public.medical_profiles DROP COLUMN IF EXISTS trimester;
-- ALTER TABLE public.medical_profiles DROP COLUMN IF EXISTS days_in_week;

-- Bước 4: Recreate view admin_dashboard_stats (dùng created_by thay user_id)
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM public.users WHERE role = 'mother'::user_role) AS total_mothers,
  (SELECT COUNT(*) FROM public.users WHERE role = 'father'::user_role) AS total_fathers,
  (SELECT COUNT(*) FROM public.babies) AS total_babies,
  (SELECT COUNT(*) FROM public.babies WHERE status = 'pregnant') AS babies_pregnant,
  (SELECT COUNT(*) FROM public.babies WHERE status = 'born') AS babies_born,
  (SELECT COUNT(*) FROM public.partnerships WHERE status = 'accepted'::partnership_status) AS total_partnerships,
  (SELECT COUNT(DISTINCT created_by) FROM public.babies) AS users_with_babies;

-- -------------------------------------------------------
-- KIỂM TRA KẾT QUẢ
-- -------------------------------------------------------
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'babies' AND table_schema = 'public'
-- ORDER BY ordinal_position;
