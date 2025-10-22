-- =====================================================
-- Add urban and extra-urban consumption fields
-- =====================================================
-- This migration adds city and highway fuel consumption
-- fields to complement the existing combined consumption

ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS urban_consumption NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS extra_urban_consumption NUMERIC(4,1);

-- Add comments for documentation
COMMENT ON COLUMN public.car_trims.urban_consumption IS 'City/urban fuel consumption in L/100km';
COMMENT ON COLUMN public.car_trims.extra_urban_consumption IS 'Highway/extra-urban fuel consumption in L/100km';

