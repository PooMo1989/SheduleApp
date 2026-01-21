-- ============================================================
-- Migration 014: Storage Bucket RLS Policies
-- Purpose: Enable RLS for tenant-assets storage bucket
-- ============================================================

-- NOTE: This SQL should be run in Supabase Dashboard > SQL Editor
-- The storage bucket "tenant-assets" must be created first in Dashboard

-- ============================
-- 1. STORAGE RLS POLICIES
-- ============================

-- Allow authenticated users to upload to their tenant's folder
CREATE POLICY "tenant_upload_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tenant-assets' AND
  (storage.foldername(name))[1] = (
    SELECT tenant_id::TEXT FROM public.users WHERE id = auth.uid()
  )
);

-- Allow authenticated users to update files in their tenant's folder
CREATE POLICY "tenant_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tenant-assets' AND
  (storage.foldername(name))[1] = (
    SELECT tenant_id::TEXT FROM public.users WHERE id = auth.uid()
  )
);

-- Allow authenticated users to delete files in their tenant's folder
CREATE POLICY "tenant_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tenant-assets' AND
  (storage.foldername(name))[1] = (
    SELECT tenant_id::TEXT FROM public.users WHERE id = auth.uid()
  )
);

-- Allow public read access (since bucket is public)
CREATE POLICY "public_read_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tenant-assets');

-- ============================================================
-- MIGRATION COMPLETE
-- Storage bucket now has tenant-isolated upload/delete policies
-- ============================================================
