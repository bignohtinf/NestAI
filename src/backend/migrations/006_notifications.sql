-- ============================================================================
-- Migration 006: Create notifications table
-- Bảng thông báo cho user (meal plan alerts, partnership, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,                    -- 'meal_plan_created' | 'meal_plan_updated' | 'partnership_request' | ...
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',                      -- metadata: {plan_date, target, plan_id, ...}
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying user's unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, is_read, created_at DESC);

-- Index for querying by type
CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON public.notifications(user_id, type);

-- RLS: user can only see their own notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- Service role bypass
CREATE POLICY "notifications_service" ON public.notifications
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE public.notifications IS 'In-app notifications for users (meal plans, partnerships, etc.)';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: meal_plan_created, meal_plan_updated, partnership_request';
COMMENT ON COLUMN public.notifications.data IS 'JSON metadata: plan_date, target, plan_id, etc.';
