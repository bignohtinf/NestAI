-- ============================================================================
-- Migration 003: Create partnerships table
-- Lưu mối quan hệ giữa mẹ và bố
-- ============================================================================

-- Create partnership_status enum type (skip if already exists)
DO $$ BEGIN
  CREATE TYPE public.partnership_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.partnerships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  father_id uuid NOT NULL,
  mother_id uuid NOT NULL,
  status public.partnership_status NOT NULL DEFAULT 'pending'::public.partnership_status,
  requested_by uuid NOT NULL,
  requested_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  responded_at timestamp with time zone,
  responded_by uuid,
  notes text,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT partnerships_pkey PRIMARY KEY (id),
  CONSTRAINT partnerships_father_id_fkey FOREIGN KEY (father_id)
    REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT partnerships_mother_id_fkey FOREIGN KEY (mother_id)
    REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT partnerships_requested_by_fkey FOREIGN KEY (requested_by)
    REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT partnerships_responded_by_fkey FOREIGN KEY (responded_by)
    REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_partnerships_father_id ON public.partnerships(father_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_mother_id ON public.partnerships(mother_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON public.partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_requested_by ON public.partnerships(requested_by);

COMMENT ON TABLE public.partnerships IS 'Mối quan hệ giữa mẹ và bố';
COMMENT ON COLUMN public.partnerships.father_id IS 'User ID của bố';
COMMENT ON COLUMN public.partnerships.mother_id IS 'User ID của mẹ';
COMMENT ON COLUMN public.partnerships.status IS 'Trạng thái: pending, accepted, rejected, cancelled';
COMMENT ON COLUMN public.partnerships.requested_by IS 'User ID của người gửi yêu cầu';
COMMENT ON COLUMN public.partnerships.requested_at IS 'Thời gian gửi yêu cầu';
COMMENT ON COLUMN public.partnerships.responded_at IS 'Thời gian phản hồi';
COMMENT ON COLUMN public.partnerships.responded_by IS 'User ID của người phản hồi';
COMMENT ON COLUMN public.partnerships.notes IS 'Ghi chú từ người phản hồi';
