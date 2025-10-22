-- =====================================================
-- FIX: Yanlış Yakıt Tüketim Verilerini Düzelt
-- =====================================================
-- Bu script, "- l/100km" değerlerinin yanlış parse edilmesiyle
-- oluşan 100 L/100km gibi imkansız değerleri NULL yapar.
--
-- Supabase Dashboard > SQL Editor > New Query
-- Bu kodu yapıştır ve RUN'a bas

-- 1. Yanlış verileri kontrol et
SELECT 
  COUNT(*) as total_trims,
  COUNT(CASE WHEN avg_consumption >= 50 THEN 1 END) as bad_avg,
  COUNT(CASE WHEN urban_consumption >= 50 THEN 1 END) as bad_urban,
  COUNT(CASE WHEN extra_urban_consumption >= 50 THEN 1 END) as bad_extra
FROM car_trims;

-- 2. Örnekleri gör
SELECT 
  cm.name as model,
  cb.name as brand,
  ct.year,
  ct.avg_consumption,
  ct.urban_consumption,
  ct.extra_urban_consumption
FROM car_trims ct
JOIN car_models cm ON ct.model_id = cm.id
JOIN car_brands cb ON cm.brand_id = cb.id
WHERE ct.avg_consumption >= 50 
   OR ct.urban_consumption >= 50 
   OR ct.extra_urban_consumption >= 50
LIMIT 20;

-- 3. Yanlış verileri düzelt
-- NOT: Normal arabalar 3-15 L/100km arası tüketir
-- 50'den büyük değerler kesinlikle yanlış!

UPDATE car_trims
SET 
  avg_consumption = NULL
WHERE avg_consumption >= 50;

UPDATE car_trims
SET 
  urban_consumption = NULL
WHERE urban_consumption >= 50;

UPDATE car_trims
SET 
  extra_urban_consumption = NULL
WHERE extra_urban_consumption >= 50;

-- 4. Sonuçları doğrula
SELECT 
  COUNT(*) as total_trims,
  COUNT(avg_consumption) as has_avg,
  COUNT(urban_consumption) as has_urban,
  COUNT(extra_urban_consumption) as has_extra,
  COUNT(CASE WHEN avg_consumption >= 50 THEN 1 END) as bad_avg_remaining,
  COUNT(CASE WHEN urban_consumption >= 50 THEN 1 END) as bad_urban_remaining,
  COUNT(CASE WHEN extra_urban_consumption >= 50 THEN 1 END) as bad_extra_remaining
FROM car_trims;

-- Peugeot 5008'i kontrol et
SELECT 
  ct.year,
  ct.trim_name,
  ct.avg_consumption,
  ct.urban_consumption,
  ct.extra_urban_consumption
FROM car_trims ct
JOIN car_models cm ON ct.model_id = cm.id
WHERE cm.name = '5008' 
  AND cm.brand_id = (SELECT id FROM car_brands WHERE name = 'Peugeot')
LIMIT 5;

-- ✅ Artık Peugeot 5008 ve diğer araçlar için
-- yakıt tüketim değerleri NULL olacak (gösterilmeyecek)
-- Bu, yanlış "100 L/100km" değerinden daha iyi!

