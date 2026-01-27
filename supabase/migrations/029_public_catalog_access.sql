-- ============================================================
-- Migration 029: Public Catalog Access (Fix 404)
-- Allows unauthenticated users (guests) to view tenants, services,
-- and availability data for the booking flow.
-- ============================================================

-- 1. Tenants (Public Profile)
CREATE POLICY "public_tenants_select"
  ON public.tenants FOR SELECT
  USING (true);

-- 2. Services (Public Catalog)
CREATE POLICY "public_services_select"
  ON public.services FOR SELECT
  USING (true);

-- 3. Providers (Public Profiles)
CREATE POLICY "public_providers_select"
  ON public.providers FOR SELECT
  USING (true);

-- 4. Service Providers (Junction)
CREATE POLICY "public_service_providers_select"
  ON public.service_providers FOR SELECT
  USING (true);

-- 5. Categories (Service Organization)
CREATE POLICY "public_categories_select"
  ON public.categories FOR SELECT
  USING (true);

-- 6. Schedule Config (For Availability Engine)
CREATE POLICY "public_provider_schedules_select"
  ON public.provider_schedules FOR SELECT
  USING (true);

CREATE POLICY "public_schedule_overrides_select"
  ON public.schedule_overrides FOR SELECT
  USING (true);

CREATE POLICY "public_service_schedules_select"
  ON public.service_schedules FOR SELECT
  USING (true);

CREATE POLICY "public_service_schedule_overrides_select"
  ON public.service_schedule_overrides FOR SELECT
  USING (true);

-- Note: We do NOT open up 'bookings' table here. 
-- Conflict checking for public users requires a Security Definer function 
-- or Service Role approach to prevent leaking client data.
