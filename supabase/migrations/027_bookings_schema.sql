-- ============================================================
-- Migration 027: Bookings Table Schema (Epic 4 - Availability Engine)
-- Purpose: Layer 4 of 5-layer availability engine - internal bookings
-- Includes: btree_gist extension, exclusion constraint, RLS
-- ============================================================

-- ============================
-- 0. ENABLE REQUIRED EXTENSION
-- ============================

-- btree_gist is required for exclusion constraints on non-btree types (like tstzrange)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================
-- 1. BOOKING STATUS ENUM
-- ============================

-- Create enum type for booking status (lowercase to match codebase convention)
DO $$ BEGIN
    CREATE TYPE public.booking_status AS ENUM (
        'pending',
        'confirmed',
        'cancelled',
        'rejected',
        'completed',
        'no_show'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================
-- 2. BOOKINGS TABLE
-- ============================

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign keys
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT,
    client_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

    -- Timing (stored in UTC)
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    -- Snapshot fields (immutable after creation - captures service config at booking time)
    duration_minutes INTEGER NOT NULL,
    buffer_before_minutes INTEGER NOT NULL DEFAULT 0,
    buffer_after_minutes INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',

    -- Status tracking
    status public.booking_status NOT NULL DEFAULT 'pending',

    -- Client info (for guest bookings without user account)
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_notes TEXT,

    -- Admin/provider notes (internal)
    internal_notes TEXT,

    -- Cancellation tracking
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES public.users(id),
    cancellation_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT bookings_time_order CHECK (start_time < end_time),
    CONSTRAINT bookings_duration_positive CHECK (duration_minutes > 0),
    CONSTRAINT bookings_buffer_non_negative CHECK (
        buffer_before_minutes >= 0 AND buffer_after_minutes >= 0
    ),
    CONSTRAINT bookings_price_non_negative CHECK (price IS NULL OR price >= 0),

    -- Exclusion constraint: prevents overlapping bookings for the same provider
    -- Note: Buffer times are enforced at application layer during booking creation
    -- This constraint prevents core time overlap; app layer adds buffer padding
    CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
        provider_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    ) WHERE (status NOT IN ('cancelled', 'rejected'))
);

COMMENT ON TABLE public.bookings IS 'Layer 4 of availability engine - stores all booking records with conflict prevention';
COMMENT ON COLUMN public.bookings.duration_minutes IS 'Snapshot of service duration at booking time';
COMMENT ON COLUMN public.bookings.buffer_before_minutes IS 'Snapshot of buffer before at booking time';
COMMENT ON COLUMN public.bookings.buffer_after_minutes IS 'Snapshot of buffer after at booking time';
COMMENT ON COLUMN public.bookings.price IS 'Snapshot of service price at booking time';

-- ============================
-- 3. INDEXES
-- ============================

-- Primary lookup patterns
CREATE INDEX IF NOT EXISTS idx_bookings_tenant
    ON public.bookings(tenant_id);

CREATE INDEX IF NOT EXISTS idx_bookings_service
    ON public.bookings(service_id);

CREATE INDEX IF NOT EXISTS idx_bookings_provider
    ON public.bookings(provider_id);

CREATE INDEX IF NOT EXISTS idx_bookings_client_user
    ON public.bookings(client_user_id) WHERE client_user_id IS NOT NULL;

-- Time range queries (for availability checks)
CREATE INDEX IF NOT EXISTS idx_bookings_provider_time
    ON public.bookings(provider_id, start_time, end_time);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_bookings_status
    ON public.bookings(status);

-- Active bookings filter (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_bookings_active
    ON public.bookings(provider_id, start_time)
    WHERE status NOT IN ('cancelled', 'rejected');

-- Client email lookup (for guest booking history)
CREATE INDEX IF NOT EXISTS idx_bookings_client_email
    ON public.bookings(tenant_id, client_email);

-- Date range queries for admin dashboard
CREATE INDEX IF NOT EXISTS idx_bookings_date_range
    ON public.bookings(tenant_id, start_time DESC);

-- ============================
-- 4. ROW LEVEL SECURITY
-- ============================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Admins/Owners: Full access to all bookings in their tenant
CREATE POLICY "bookings_admin_all"
    ON public.bookings
    FOR ALL
    USING (
        tenant_id = public.get_current_tenant_id()
        AND public.is_admin()
    )
    WITH CHECK (
        tenant_id = public.get_current_tenant_id()
        AND public.is_admin()
    );

-- Providers: Read their own bookings
CREATE POLICY "bookings_provider_select"
    ON public.bookings
    FOR SELECT
    USING (
        tenant_id = public.get_current_tenant_id()
        AND provider_id IN (
            SELECT id FROM public.providers WHERE user_id = auth.uid()
        )
    );

-- Providers: Update status on their own bookings (confirm, complete, no_show)
CREATE POLICY "bookings_provider_update"
    ON public.bookings
    FOR UPDATE
    USING (
        tenant_id = public.get_current_tenant_id()
        AND provider_id IN (
            SELECT id FROM public.providers WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        tenant_id = public.get_current_tenant_id()
        AND provider_id IN (
            SELECT id FROM public.providers WHERE user_id = auth.uid()
        )
    );

-- Clients: Read their own bookings
CREATE POLICY "bookings_client_select"
    ON public.bookings
    FOR SELECT
    USING (
        tenant_id = public.get_current_tenant_id()
        AND client_user_id = auth.uid()
    );

-- Clients: Cancel their own bookings
CREATE POLICY "bookings_client_cancel"
    ON public.bookings
    FOR UPDATE
    USING (
        tenant_id = public.get_current_tenant_id()
        AND client_user_id = auth.uid()
        AND status NOT IN ('completed', 'no_show')
    )
    WITH CHECK (
        tenant_id = public.get_current_tenant_id()
        AND client_user_id = auth.uid()
    );

-- Public: Insert new bookings (for widget - validated at app layer)
CREATE POLICY "bookings_public_insert"
    ON public.bookings
    FOR INSERT
    WITH CHECK (
        tenant_id = public.get_current_tenant_id()
    );

-- ============================
-- 5. UPDATED_AT TRIGGER
-- ============================

CREATE TRIGGER handle_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
