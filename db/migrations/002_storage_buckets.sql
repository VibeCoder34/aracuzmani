-- =====================================================
-- AracUzmanı Storage Buckets Configuration
-- =====================================================
-- This migration creates storage buckets for avatars and review images
--
-- NOTE: Bucket creation via SQL requires service role or admin privileges.
-- If this fails, create buckets manually in Supabase Dashboard > Storage:
--   1. Create bucket "avatars" with public: true
--   2. Create bucket "review-images" with public: true
-- Then run the policy section below.

-- =====================================================
-- 1. CREATE STORAGE BUCKETS
-- =====================================================

-- Create avatars bucket (user profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create review-images bucket (photos attached to reviews)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. STORAGE POLICIES
-- =====================================================

-- =====================================================
-- AVATARS BUCKET POLICIES
-- =====================================================

-- Allow public read access to all avatars
DROP POLICY IF EXISTS "Public avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Public avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars to their own folder
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Allow users to update their own avatars
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Allow users to delete their own avatars
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- =====================================================
-- REVIEW-IMAGES BUCKET POLICIES
-- =====================================================

-- Allow public read access to all review images
DROP POLICY IF EXISTS "Review images are publicly accessible" ON storage.objects;
CREATE POLICY "Review images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

-- Allow authenticated users to upload review images to their own folder
DROP POLICY IF EXISTS "Users can upload their own review images" ON storage.objects;
CREATE POLICY "Users can upload their own review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images' 
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Allow users to update their own review images
DROP POLICY IF EXISTS "Users can update their own review images" ON storage.objects;
CREATE POLICY "Users can update their own review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-images' 
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
)
WITH CHECK (
  bucket_id = 'review-images' 
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Allow users to delete their own review images
DROP POLICY IF EXISTS "Users can delete their own review images" ON storage.objects;
CREATE POLICY "Users can delete their own review images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images' 
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- Allow moderators and admins to delete any review image
DROP POLICY IF EXISTS "Moderators can delete any review image" ON storage.objects;
CREATE POLICY "Moderators can delete any review image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- =====================================================
-- Migration Complete
-- =====================================================
-- Storage buckets created with appropriate policies
-- Next: Run 003_rls_policies.sql for table-level security

