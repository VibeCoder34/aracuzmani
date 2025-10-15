-- =====================================================
-- FIX: 500 Error when adding trim
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add image_urls column if it doesn't exist
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.car_trims.image_urls IS 'Array of public image URLs from Supabase Storage';

-- Create index for querying cars with images
CREATE INDEX IF NOT EXISTS idx_trims_with_images ON public.car_trims 
USING GIN (image_urls) 
WHERE array_length(image_urls, 1) > 0;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'car_trims' 
AND column_name = 'image_urls';

-- Done! Now try adding a trim again.

