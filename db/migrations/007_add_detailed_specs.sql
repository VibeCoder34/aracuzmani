-- =====================================================
-- Add detailed specification fields to car_trims table
-- =====================================================
-- This migration adds new fields for storing detailed
-- car specifications that will be used in the rating system

-- Add interior design specs
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS seat_count INT,
ADD COLUMN IF NOT EXISTS trunk_volume INT;

-- Add exterior design specs
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS door_count INT,
ADD COLUMN IF NOT EXISTS width INT,
ADD COLUMN IF NOT EXISTS length INT,
ADD COLUMN IF NOT EXISTS height INT,
ADD COLUMN IF NOT EXISTS weight INT,
ADD COLUMN IF NOT EXISTS body_type TEXT;

-- Add fuel economy specs
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS fuel_type TEXT,
ADD COLUMN IF NOT EXISTS avg_consumption NUMERIC(4,1);

-- Add performance specs
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS max_torque INT,
ADD COLUMN IF NOT EXISTS max_speed INT,
ADD COLUMN IF NOT EXISTS acceleration_0_to_100 NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS horsepower INT,
ADD COLUMN IF NOT EXISTS transmission_type TEXT,
ADD COLUMN IF NOT EXISTS drive_type TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.car_trims.seat_count IS 'Number of seats in the car';
COMMENT ON COLUMN public.car_trims.trunk_volume IS 'Trunk/cargo volume in liters';
COMMENT ON COLUMN public.car_trims.door_count IS 'Number of doors';
COMMENT ON COLUMN public.car_trims.width IS 'Width in millimeters';
COMMENT ON COLUMN public.car_trims.length IS 'Length in millimeters';
COMMENT ON COLUMN public.car_trims.height IS 'Height in millimeters';
COMMENT ON COLUMN public.car_trims.weight IS 'Curb weight in kilograms';
COMMENT ON COLUMN public.car_trims.body_type IS 'Body type (sedan, SUV, hatchback, etc.)';
COMMENT ON COLUMN public.car_trims.fuel_type IS 'Fuel type (gasoline, diesel, electric, hybrid, etc.)';
COMMENT ON COLUMN public.car_trims.avg_consumption IS 'Average fuel consumption in L/100km';
COMMENT ON COLUMN public.car_trims.max_torque IS 'Maximum torque in Nm';
COMMENT ON COLUMN public.car_trims.max_speed IS 'Maximum speed in km/h';
COMMENT ON COLUMN public.car_trims.acceleration_0_to_100 IS '0-100 km/h acceleration time in seconds';
COMMENT ON COLUMN public.car_trims.horsepower IS 'Horsepower (HP)';
COMMENT ON COLUMN public.car_trims.transmission_type IS 'Transmission type (manual, automatic, CVT, etc.)';
COMMENT ON COLUMN public.car_trims.drive_type IS 'Drive type (FWD, RWD, AWD, 4WD)';

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_trims_body_type ON public.car_trims(body_type);
CREATE INDEX IF NOT EXISTS idx_trims_fuel_type ON public.car_trims(fuel_type);
CREATE INDEX IF NOT EXISTS idx_trims_horsepower ON public.car_trims(horsepower);

-- Migration complete

