-- =====================================================
-- AracUzmanı Reference Data Seeding
-- =====================================================
-- This migration populates car brands, models, and trims
-- with real Turkish market data for development and testing

-- =====================================================
-- 1. CAR BRANDS
-- =====================================================

INSERT INTO public.car_brands (name, country) VALUES
  ('Renault', 'Fransa'),
  ('Toyota', 'Japonya'),
  ('Volkswagen', 'Almanya'),
  ('Hyundai', 'Güney Kore'),
  ('Fiat', 'İtalya'),
  ('Ford', 'ABD'),
  ('Opel', 'Almanya'),
  ('Honda', 'Japonya'),
  ('Peugeot', 'Fransa'),
  ('Nissan', 'Japonya'),
  ('Mazda', 'Japonya'),
  ('Kia', 'Güney Kore'),
  ('Mercedes-Benz', 'Almanya'),
  ('BMW', 'Almanya'),
  ('Audi', 'Almanya'),
  ('Škoda', 'Çekya'),
  ('Dacia', 'Romanya'),
  ('Citroën', 'Fransa'),
  ('Seat', 'İspanya'),
  ('Tesla', 'ABD')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. CAR MODELS (Popular Turkish Market Models)
-- =====================================================

-- Renault Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Clio', 2012, NULL),
  ('Megane', 2016, NULL),
  ('Taliant', 2021, NULL),
  ('Captur', 2013, NULL),
  ('Kadjar', 2015, NULL),
  ('Koleos', 2017, NULL),
  ('Austral', 2022, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Renault'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Toyota Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Corolla', 2013, NULL),
  ('C-HR', 2016, NULL),
  ('RAV4', 2013, NULL),
  ('Yaris', 2011, NULL),
  ('Camry', 2018, NULL),
  ('Land Cruiser', 2007, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Toyota'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Volkswagen Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Golf', 2012, NULL),
  ('Polo', 2017, NULL),
  ('Passat', 2014, NULL),
  ('Tiguan', 2016, NULL),
  ('T-Roc', 2017, NULL),
  ('ID.4', 2021, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Volkswagen'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Hyundai Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('i20', 2014, NULL),
  ('i10', 2013, NULL),
  ('Tucson', 2015, NULL),
  ('Kona', 2017, NULL),
  ('Santa Fe', 2018, NULL),
  ('Bayon', 2021, NULL),
  ('IONIQ 5', 2021, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Hyundai'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Fiat Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Egea', 2015, NULL),
  ('Panda', 2011, NULL),
  ('500', 2015, NULL),
  ('500X', 2014, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Fiat'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Ford Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Focus', 2014, NULL),
  ('Fiesta', 2017, 2023),
  ('Kuga', 2019, NULL),
  ('Puma', 2019, NULL),
  ('Ranger', 2011, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Ford'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Honda Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Civic', 2016, NULL),
  ('CR-V', 2017, NULL),
  ('Jazz', 2015, 2023),
  ('HR-V', 2015, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Honda'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Kia Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Sportage', 2016, NULL),
  ('Picanto', 2017, NULL),
  ('Stonic', 2017, NULL),
  ('Ceed', 2018, NULL),
  ('XCeed', 2019, NULL),
  ('EV6', 2021, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Kia'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Dacia Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Duster', 2017, NULL),
  ('Sandero', 2020, NULL),
  ('Jogger', 2021, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Dacia'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Tesla Models
INSERT INTO public.car_models (brand_id, name, start_year, end_year)
SELECT id, model, start_year::INT, end_year::INT
FROM public.car_brands, (VALUES
  ('Model 3', 2019, NULL),
  ('Model Y', 2021, NULL),
  ('Model S', 2012, NULL),
  ('Model X', 2015, NULL)
) AS models(model, start_year, end_year)
WHERE car_brands.name = 'Tesla'
ON CONFLICT (brand_id, name) DO NOTHING;

-- =====================================================
-- 3. CAR TRIMS (Sample variants for popular models)
-- =====================================================

-- Renault Clio Trims (2019-2024)
INSERT INTO public.car_trims (model_id, year, trim_name, engine, transmission, drivetrain)
SELECT m.id, t.year, t.trim_name, t.engine, t.transmission, t.drivetrain
FROM public.car_models m, (VALUES
  (2019, 'Joy', '0.9 TCe', 'Manuel', 'FWD'),
  (2019, 'Touch', '0.9 TCe', 'Manuel', 'FWD'),
  (2020, 'Joy', '1.0 SCe', 'Manuel', 'FWD'),
  (2020, 'Touch', '1.3 TCe', 'EDC', 'FWD'),
  (2021, 'Icon', '1.0 TCe', 'Manuel', 'FWD'),
  (2022, 'Icon', '1.0 TCe', 'CVT', 'FWD'),
  (2023, 'Evolution', '1.0 TCe', 'Manuel', 'FWD'),
  (2024, 'Techno', '1.3 TCe', 'EDC', 'FWD')
) AS t(year, trim_name, engine, transmission, drivetrain)
WHERE m.name = 'Clio' AND m.brand_id = (SELECT id FROM public.car_brands WHERE name = 'Renault')
ON CONFLICT DO NOTHING;

-- Toyota Corolla Trims (2019-2024)
INSERT INTO public.car_trims (model_id, year, trim_name, engine, transmission, drivetrain)
SELECT m.id, t.year, t.trim_name, t.engine, t.transmission, t.drivetrain
FROM public.car_models m, (VALUES
  (2019, 'Touch', '1.6 Valvematic', 'Manuel', 'FWD'),
  (2020, 'Dream', '1.8 Hybrid', 'e-CVT', 'FWD'),
  (2021, 'Flame', '2.0 Hybrid', 'e-CVT', 'FWD'),
  (2022, 'Flame X', '2.0 Hybrid', 'e-CVT', 'FWD'),
  (2023, 'GR Sport', '2.0 Hybrid', 'e-CVT', 'FWD'),
  (2024, 'Premium', '2.0 Hybrid', 'e-CVT', 'FWD')
) AS t(year, trim_name, engine, transmission, drivetrain)
WHERE m.name = 'Corolla' AND m.brand_id = (SELECT id FROM public.car_brands WHERE name = 'Toyota')
ON CONFLICT DO NOTHING;

-- Volkswagen Golf Trims (2020-2024)
INSERT INTO public.car_trims (model_id, year, trim_name, engine, transmission, drivetrain)
SELECT m.id, t.year, t.trim_name, t.engine, t.transmission, t.drivetrain
FROM public.car_models m, (VALUES
  (2020, 'Comfortline', '1.5 TSI', 'Manuel', 'FWD'),
  (2021, 'Highline', '1.5 eTSI', 'DSG', 'FWD'),
  (2022, 'R-Line', '2.0 TDI', 'DSG', 'FWD'),
  (2023, 'Style', '1.5 eTSI', 'DSG', 'FWD'),
  (2024, 'Life', '2.0 TDI', 'DSG', 'FWD')
) AS t(year, trim_name, engine, transmission, drivetrain)
WHERE m.name = 'Golf' AND m.brand_id = (SELECT id FROM public.car_brands WHERE name = 'Volkswagen')
ON CONFLICT DO NOTHING;

-- Hyundai Tucson Trims (2021-2024)
INSERT INTO public.car_trims (model_id, year, trim_name, engine, transmission, drivetrain)
SELECT m.id, t.year, t.trim_name, t.engine, t.transmission, t.drivetrain
FROM public.car_models m, (VALUES
  (2021, 'Style', '1.6 T-GDI', 'DCT', 'FWD'),
  (2021, 'Style Plus', '1.6 T-GDI', 'DCT', 'AWD'),
  (2022, 'Elite', '1.6 T-GDI Hybrid', 'DCT', 'FWD'),
  (2023, 'Elite Plus', '1.6 T-GDI Hybrid', 'DCT', 'AWD'),
  (2024, 'Elegance', '1.6 T-GDI', 'DCT', 'FWD')
) AS t(year, trim_name, engine, transmission, drivetrain)
WHERE m.name = 'Tucson' AND m.brand_id = (SELECT id FROM public.car_brands WHERE name = 'Hyundai')
ON CONFLICT DO NOTHING;

-- Tesla Model 3 Trims (2021-2024)
INSERT INTO public.car_trims (model_id, year, trim_name, engine, transmission, drivetrain)
SELECT m.id, t.year, t.trim_name, t.engine, t.transmission, t.drivetrain
FROM public.car_models m, (VALUES
  (2021, 'Standard Range Plus', 'Electric', 'Otomatik', 'RWD'),
  (2022, 'Long Range', 'Electric', 'Otomatik', 'AWD'),
  (2023, 'Performance', 'Electric', 'Otomatik', 'AWD'),
  (2024, 'Highland', 'Electric', 'Otomatik', 'RWD')
) AS t(year, trim_name, engine, transmission, drivetrain)
WHERE m.name = 'Model 3' AND m.brand_id = (SELECT id FROM public.car_brands WHERE name = 'Tesla')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Reference data populated with Turkish market vehicles
-- Ready for production use or further seeding

