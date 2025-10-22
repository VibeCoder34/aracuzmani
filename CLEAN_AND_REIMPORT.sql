-- =====================================================
-- ADIM 1: Supabase Dashboard'da BUNU ÇALIŞTIR
-- =====================================================
-- https://supabase.com/dashboard
-- SQL Editor > New Query

-- 1. Migration ekle (yeni kolonlar)
ALTER TABLE public.car_trims 
ADD COLUMN IF NOT EXISTS urban_consumption NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS extra_urban_consumption NUMERIC(4,1);

COMMENT ON COLUMN public.car_trims.urban_consumption IS 'City/urban fuel consumption in L/100km';
COMMENT ON COLUMN public.car_trims.extra_urban_consumption IS 'Highway/extra-urban fuel consumption in L/100km';

-- 2. ESKİ VERİLERİ SİL (Hepsi NULL zaten)
DELETE FROM car_trims;
DELETE FROM car_models;
DELETE FROM car_brands;

-- 3. Doğrula (hepsi 0 olmalı)
SELECT 
  (SELECT COUNT(*) FROM car_trims) as trims_count,
  (SELECT COUNT(*) FROM car_models) as models_count,
  (SELECT COUNT(*) FROM car_brands) as brands_count;

-- Sonuç 0, 0, 0 olmalı

