-- =====================================================
-- AracUzmanı Database Schema - Initial Migration
-- =====================================================
-- This migration creates all core tables, triggers, and functions
-- Run this first before other migrations

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Extends auth.users with application-specific profile data

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'moderator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT username_length CHECK (username IS NULL OR (LENGTH(username) >= 3 AND LENGTH(username) <= 24)),
  CONSTRAINT username_format CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]+$')
);

-- Indexes for profiles
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 2. CAR BRANDS, MODELS, AND TRIMS
-- =====================================================

-- Car Brands (Renault, Toyota, etc.)
CREATE TABLE IF NOT EXISTS public.car_brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_brands_name ON public.car_brands(name);

-- Car Models (Clio, Corolla, etc.)
CREATE TABLE IF NOT EXISTS public.car_models (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES public.car_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_year INT,
  end_year INT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_brand_model UNIQUE(brand_id, name)
);

CREATE INDEX idx_models_brand_id ON public.car_models(brand_id);
CREATE INDEX idx_models_name ON public.car_models(name);

-- Car Trims (specific year/engine/transmission variants)
CREATE TABLE IF NOT EXISTS public.car_trims (
  id BIGSERIAL PRIMARY KEY,
  model_id BIGINT NOT NULL REFERENCES public.car_models(id) ON DELETE CASCADE,
  year INT NOT NULL,
  trim_name TEXT,
  engine TEXT,
  transmission TEXT,
  drivetrain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_trim UNIQUE(model_id, year, trim_name, engine, transmission)
);

CREATE INDEX idx_trims_model_id ON public.car_trims(model_id);
CREATE INDEX idx_trims_model_year ON public.car_trims(model_id, year);

-- =====================================================
-- 3. REVIEW CATEGORIES
-- =====================================================
-- Scoring dimensions (Konfor, Sürüş, Yakıt, etc.)

CREATE TABLE IF NOT EXISTS public.review_categories (
  id SMALLSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  weight NUMERIC DEFAULT 1.0 NOT NULL,
  display_order INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default Turkish categories
INSERT INTO public.review_categories (key, label, weight, display_order) VALUES
  ('comfort', 'Konfor', 1.0, 1),
  ('drive', 'Sürüş', 1.0, 2),
  ('fuel', 'Yakıt Ekonomisi', 1.0, 3),
  ('reliability', 'Güvenilirlik', 1.2, 4),
  ('maintenance', 'Bakım Maliyeti', 1.0, 5),
  ('interior', 'İç Mekân', 0.8, 6),
  ('tech', 'Teknoloji', 0.8, 7),
  ('performance', 'Performans', 1.0, 8)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 4. REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trim_id BIGINT NOT NULL REFERENCES public.car_trims(id) ON DELETE RESTRICT,
  title TEXT,
  body TEXT,
  ratings JSONB NOT NULL,
  avg_score NUMERIC,
  pros TEXT[] DEFAULT '{}' NOT NULL,
  cons TEXT[] DEFAULT '{}' NOT NULL,
  status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('published', 'pending', 'rejected', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT ratings_format CHECK (jsonb_typeof(ratings) = 'object')
);

-- Indexes for reviews
CREATE INDEX idx_reviews_author_id ON public.reviews(author_id);
CREATE INDEX idx_reviews_trim_id ON public.reviews(trim_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX idx_reviews_avg_score ON public.reviews(avg_score DESC NULLS LAST);

-- =====================================================
-- 5. REVIEW VOTES
-- =====================================================
-- Helpful/upvote system

CREATE TABLE IF NOT EXISTS public.review_votes (
  review_id BIGINT NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (review_id, user_id)
);

CREATE INDEX idx_votes_review_id ON public.review_votes(review_id);
CREATE INDEX idx_votes_user_id ON public.review_votes(user_id);

-- =====================================================
-- 6. COMMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('published', 'pending', 'rejected', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT comment_body_length CHECK (LENGTH(body) >= 1 AND LENGTH(body) <= 2000)
);

CREATE INDEX idx_comments_review_id ON public.comments(review_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_comments_status ON public.comments(status);

-- =====================================================
-- 7. FAVORITES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  review_id BIGINT NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (user_id, review_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_review_id ON public.favorites(review_id);

-- =====================================================
-- 8. REPORTS (Moderation)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id BIGSERIAL PRIMARY KEY,
  reported_type TEXT NOT NULL CHECK (reported_type IN ('review', 'comment')),
  reported_id BIGINT NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'closed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT reason_length CHECK (LENGTH(reason) >= 10 AND LENGTH(reason) <= 500)
);

CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_type_id ON public.reports(reported_type, reported_id);

-- =====================================================
-- 9. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger: Create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger: Update reviews.updated_at
DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Calculate weighted average score from ratings
CREATE OR REPLACE FUNCTION public.calculate_review_avg_score(ratings_json JSONB)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total_score NUMERIC := 0;
  total_weight NUMERIC := 0;
  category RECORD;
  rating_value NUMERIC;
BEGIN
  -- Loop through all categories and calculate weighted average
  FOR category IN 
    SELECT key, weight FROM public.review_categories
  LOOP
    -- Get rating value for this category (default to 5 if missing)
    rating_value := COALESCE((ratings_json->>category.key)::NUMERIC, 5);
    
    -- Add to totals
    total_score := total_score + (rating_value * category.weight);
    total_weight := total_weight + category.weight;
  END LOOP;
  
  -- Return weighted average, or NULL if no weights
  IF total_weight > 0 THEN
    RETURN ROUND(total_score / total_weight, 2);
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- Function: Update avg_score on review insert/update
CREATE OR REPLACE FUNCTION public.update_review_avg_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.avg_score := public.calculate_review_avg_score(NEW.ratings);
  RETURN NEW;
END;
$$;

-- Trigger: Calculate avg_score automatically
DROP TRIGGER IF EXISTS set_review_avg_score ON public.reviews;
CREATE TRIGGER set_review_avg_score
  BEFORE INSERT OR UPDATE OF ratings ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_avg_score();

-- =====================================================
-- 10. RATE LIMITING
-- =====================================================

-- Function: Check if user is within daily limit
CREATE OR REPLACE FUNCTION public.check_daily_limit(
  table_name TEXT,
  user_id UUID,
  daily_limit INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  count_today INT;
BEGIN
  -- Count items created by user today
  IF table_name = 'reviews' THEN
    SELECT COUNT(*) INTO count_today
    FROM public.reviews
    WHERE author_id = user_id
      AND created_at > NOW() - INTERVAL '24 hours';
  ELSIF table_name = 'comments' THEN
    SELECT COUNT(*) INTO count_today
    FROM public.comments
    WHERE author_id = user_id
      AND created_at > NOW() - INTERVAL '24 hours';
  ELSE
    RETURN TRUE; -- Unknown table, allow
  END IF;
  
  RETURN count_today < daily_limit;
END;
$$;

-- Function: Enforce review rate limit
CREATE OR REPLACE FUNCTION public.enforce_review_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.check_daily_limit('reviews', NEW.author_id, 10) THEN
    RAISE EXCEPTION 'Günlük yorum limiti aşıldı. Lütfen yarın tekrar deneyin.'
      USING HINT = 'Maksimum 10 yorum/gün yapabilirsiniz.';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger: Rate limit reviews
DROP TRIGGER IF EXISTS review_rate_limit ON public.reviews;
CREATE TRIGGER review_rate_limit
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_review_rate_limit();

-- Function: Enforce comment rate limit
CREATE OR REPLACE FUNCTION public.enforce_comment_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.check_daily_limit('comments', NEW.author_id, 50) THEN
    RAISE EXCEPTION 'Günlük yorum limiti aşıldı. Lütfen yarın tekrar deneyin.'
      USING HINT = 'Maksimum 50 yorum/gün yapabilirsiniz.';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger: Rate limit comments
DROP TRIGGER IF EXISTS comment_rate_limit ON public.comments;
CREATE TRIGGER comment_rate_limit
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_comment_rate_limit();

-- =====================================================
-- 11. MATERIALIZED VIEWS (Optional - for performance)
-- =====================================================

-- View: Review stats per car trim
CREATE OR REPLACE VIEW public.trim_review_stats AS
SELECT
  t.id AS trim_id,
  t.model_id,
  t.year,
  COUNT(r.id) AS review_count,
  AVG(r.avg_score) AS avg_score,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.avg_score) AS median_score
FROM public.car_trims t
LEFT JOIN public.reviews r ON r.trim_id = t.id AND r.status = 'published'
GROUP BY t.id, t.model_id, t.year;

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next steps:
-- 1. Run 002_storage_buckets.sql to create storage buckets
-- 2. Run 003_rls_policies.sql to enable Row Level Security
-- 3. Run 004_seed_reference_data.sql for sample data

