-- =====================================================
-- ÖNCE BUNU SUPABASE'DE ÇALIŞTIR!
-- =====================================================
-- Supabase Dashboard > SQL Editor > New Query
-- Bu kodu yapıştır ve RUN'a bas

ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS urban_consumption NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS extra_urban_consumption NUMERIC(4,1);

COMMENT ON COLUMN public.car_trims.urban_consumption IS 'City/urban fuel consumption in L/100km';
COMMENT ON COLUMN public.car_trims.extra_urban_consumption IS 'Highway/extra-urban fuel consumption in L/100km';

-- Doğrulama: Bu sorgu ile yeni kolonları kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'car_trims' 
  AND column_name IN ('urban_consumption', 'extra_urban_consumption');

