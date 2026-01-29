-- Epic 4, Story 4.1: Booking Approval Tracking
-- Adds columns to track who approved bookings and why rejections occurred

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index for filtering approved bookings
CREATE INDEX IF NOT EXISTS idx_bookings_approved_at ON public.bookings(approved_at) WHERE approved_at IS NOT NULL;

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_bookings_approved_by ON public.bookings(approved_by) WHERE approved_by IS NOT NULL;

COMMENT ON COLUMN public.bookings.approved_at IS 'Timestamp when booking was approved by admin (Epic 4, Story 4.1)';
COMMENT ON COLUMN public.bookings.approved_by IS 'User ID of admin who approved the booking (Epic 4, Story 4.1)';
COMMENT ON COLUMN public.bookings.rejection_reason IS 'Reason provided when booking was rejected (Epic 4, Story 4.1)';
