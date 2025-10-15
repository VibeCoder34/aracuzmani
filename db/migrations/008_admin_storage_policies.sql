-- =====================================================
-- Admin Storage Policies for Car Images
-- =====================================================
-- This migration adds storage policies that allow admins
-- to upload car images to the review-images bucket

-- =====================================================
-- ADMIN POLICIES FOR CAR IMAGES
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

-- =====================================================
-- Migration Complete
-- =====================================================
-- Admins can now upload, update, and delete car images
-- in the review-images/cars/ folder

