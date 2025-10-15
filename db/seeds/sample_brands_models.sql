-- =====================================================
-- Additional Sample Brands and Models
-- =====================================================
-- This file adds more test data beyond the reference data migration
-- Useful for development and testing with diverse vehicle options

-- More European Brands
INSERT INTO public.car_brands (name, country) VALUES
  ('Alfa Romeo', 'İtalya'),
  ('Volvo', 'İsveç'),
  ('Jeep', 'ABD'),
  ('Land Rover', 'İngiltere'),
  ('Porsche', 'Almanya'),
  ('Mini', 'İngiltere'),
  ('Suzuki', 'Japonya'),
  ('Mitsubishi', 'Japonya'),
  ('Subaru', 'Japonya')
ON CONFLICT (name) DO NOTHING;

-- Peugeot Models (already have brand from main migration)
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year, end_year
FROM public.car_brands, (VALUES
  ('208', 2019, NULL),
  ('2008', 2019, NULL),
  ('3008', 2016, NULL),
  ('5008', 2017, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Peugeot'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Nissan Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year, end_year
FROM public.car_brands, (VALUES
  ('Qashqai', 2014, NULL),
  ('Juke', 2019, NULL),
  ('X-Trail', 2014, NULL),
  ('Micra', 2017, 2023)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Nissan'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Mercedes-Benz Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year, end_year
FROM public.car_brands, (VALUES
  ('A-Class', 2018, NULL),
  ('C-Class', 2021, NULL),
  ('E-Class', 2020, NULL),
  ('GLA', 2020, NULL),
  ('GLC', 2019, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Mercedes-Benz'
ON CONFLICT (brand_id, name) DO NOTHING;

-- BMW Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year, end_year
FROM public.car_brands, (VALUES
  ('1 Serisi', 2019, NULL),
  ('3 Serisi', 2019, NULL),
  ('5 Serisi', 2020, NULL),
  ('X1', 2022, NULL),
  ('X3', 2021, NULL),
  ('iX', 2021, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'BMW'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Škoda Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year, end_year
FROM public.car_brands, (VALUES
  ('Fabia', 2021, NULL),
  ('Scala', 2019, NULL),
  ('Octavia', 2020, NULL),
  ('Karoq', 2017, NULL),
  ('Kodiaq', 2016, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Škoda'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Sample trims for testing
INSERT INTO public.car_trims (model_id, year, trim_name, engine, transmission, drivetrain)
SELECT m.id, t.year, t.trim_name, t.engine, t.transmission, t.drivetrain
FROM public.car_models m, (VALUES
  (2023, 'Allure', '1.2 PureTech', 'Manuel', 'FWD'),
  (2023, 'GT Line', '1.2 PureTech', 'Otomatik', 'FWD'),
  (2024, 'Active', '1.2 PureTech', 'Manuel', 'FWD')
) AS t(year, trim_name, engine, transmission, drivetrain)
WHERE m.name = '208' AND m.brand_id = (SELECT id FROM public.car_brands WHERE name = 'Peugeot')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Sample Review Data (Optional)
-- =====================================================
-- Uncomment and replace USER_UUID with actual user ID to create test reviews

/*
-- Sample review for Renault Clio 2023
INSERT INTO public.reviews (author_id, trim_id, title, body, ratings, pros, cons, status)
VALUES (
  'USER_UUID_HERE',
  (SELECT id FROM public.car_trims WHERE year = 2023 AND model_id = (
    SELECT id FROM public.car_models WHERE name = 'Clio'
  ) LIMIT 1),
  'Şehir içi için harika bir araç',
  'Bir yıldır kullanıyorum ve çok memnunum. Yakıt tüketimi harika, park etmesi çok kolay.',
  '{"comfort": 8, "drive": 7, "fuel": 9, "reliability": 8, "maintenance": 7, "interior": 7, "tech": 6, "performance": 6}'::jsonb,
  ARRAY['Düşük yakıt tüketimi', 'Kolay park', 'Konforlu iç mekan'],
  ARRAY['Bagaj hacmi küçük', 'Motor biraz gürültülü'],
  'published'
);
*/

