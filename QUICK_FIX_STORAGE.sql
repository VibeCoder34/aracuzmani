-- =====================================================
-- QUICK FIX: Admin Storage Upload
-- =====================================================
-- Run this in Supabase SQL Editor to fix the
-- "new row violates row-level security policy" error
-- =====================================================

-- Allow admins to upload car images to the "cars/" folder
DROP POLICY IF EXISTS "Admins can upload car images" ON storage.objects;
CREATE POLICY "Admins can upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images' 
  AND (storage.foldername(name))[1] = 'cars'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Allow admins to update car images
DROP POLICY IF EXISTS "Admins can update car images" ON storage.objects;
CREATE POLICY "Admins can update car images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = 'cars'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
)
WITH CHECK (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = 'cars'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Allow admins to delete car images
DROP POLICY IF EXISTS "Admins can delete car images" ON storage.objects;
CREATE POLICY "Admins can delete car images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = 'cars'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Done! You should now be able to upload car images as an admin.

