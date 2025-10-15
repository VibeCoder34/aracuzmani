-- =====================================================
-- Add image URLs column to car_trims
-- =====================================================
-- This migration adds a column to store car image URLs

-- Add image_urls as a JSON array column
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.car_trims.image_urls IS 'Array of public image URLs from Supabase Storage';

-- Create index for querying cars with images
CREATE INDEX IF NOT EXISTS idx_trims_with_images ON public.car_trims 
USING GIN (image_urls) 
WHERE array_length(image_urls, 1) > 0;

-- Migration complete

