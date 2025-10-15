-- =====================================================
-- Add car_id field to reviews for frontend compatibility
-- =====================================================
-- This allows reviews to work with frontend car slugs
-- while keeping the normalized trim_id structure

-- Add car_id column (nullable for now to avoid breaking existing data)
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS car_id TEXT;

-- Create index for car_id lookups
CREATE INDEX IF NOT EXISTS idx_reviews_car_id ON public.reviews(car_id);

-- Make trim_id nullable since we're now using car_id primarily
ALTER TABLE public.reviews
ALTER COLUMN trim_id DROP NOT NULL;

-- Add check to ensure either car_id or trim_id is present
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_has_identifier CHECK (
  car_id IS NOT NULL OR trim_id IS NOT NULL
);

-- Update RLS policies to include car_id
-- (Keep existing trim_id policies for backwards compatibility)

