-- =====================================================
-- AracUzmanı Row Level Security (RLS) Policies
-- =====================================================
-- This migration enables RLS on all tables and creates security policies
-- Security-first approach: deny by default, explicit allow

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_trims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. PROFILES POLICIES
-- =====================================================

-- Anyone can view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Users can insert their own profile (handled by trigger, but allow for manual creation)
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 3. CAR DATA POLICIES (READ-ONLY FOR USERS)
-- =====================================================

-- Car brands: public read, admin write
DROP POLICY IF EXISTS "Car brands are viewable by everyone" ON public.car_brands;
CREATE POLICY "Car brands are viewable by everyone"
ON public.car_brands FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage car brands" ON public.car_brands;
CREATE POLICY "Admins can manage car brands"
ON public.car_brands FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Car models: public read, admin write
DROP POLICY IF EXISTS "Car models are viewable by everyone" ON public.car_models;
CREATE POLICY "Car models are viewable by everyone"
ON public.car_models FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage car models" ON public.car_models;
CREATE POLICY "Admins can manage car models"
ON public.car_models FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Car trims: public read, admin write
DROP POLICY IF EXISTS "Car trims are viewable by everyone" ON public.car_trims;
CREATE POLICY "Car trims are viewable by everyone"
ON public.car_trims FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage car trims" ON public.car_trims;
CREATE POLICY "Admins can manage car trims"
ON public.car_trims FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 4. REVIEW CATEGORIES POLICIES
-- =====================================================

-- Everyone can read categories
DROP POLICY IF EXISTS "Review categories are viewable by everyone" ON public.review_categories;
CREATE POLICY "Review categories are viewable by everyone"
ON public.review_categories FOR SELECT
USING (true);

-- Only admins can manage categories
DROP POLICY IF EXISTS "Admins can manage review categories" ON public.review_categories;
CREATE POLICY "Admins can manage review categories"
ON public.review_categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 5. REVIEWS POLICIES
-- =====================================================

-- Anyone can read published reviews
DROP POLICY IF EXISTS "Published reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Published reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (
  status = 'published'
  OR author_id = auth.uid() -- Authors can see their own reviews regardless of status
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  ) -- Moderators can see all
);

-- Authenticated users can create reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id
);

-- Authors can update their own reviews
DROP POLICY IF EXISTS "Authors can update their own reviews" ON public.reviews;
CREATE POLICY "Authors can update their own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Moderators and admins can update any review
DROP POLICY IF EXISTS "Moderators can update any review" ON public.reviews;
CREATE POLICY "Moderators can update any review"
ON public.reviews FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  )
);

-- Authors can delete their own reviews
DROP POLICY IF EXISTS "Authors can delete their own reviews" ON public.reviews;
CREATE POLICY "Authors can delete their own reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Moderators and admins can delete any review
DROP POLICY IF EXISTS "Moderators can delete any review" ON public.reviews;
CREATE POLICY "Moderators can delete any review"
ON public.reviews FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  )
);

-- =====================================================
-- 6. REVIEW VOTES POLICIES
-- =====================================================

-- Anyone can read votes (for counting)
DROP POLICY IF EXISTS "Review votes are viewable by everyone" ON public.review_votes;
CREATE POLICY "Review votes are viewable by everyone"
ON public.review_votes FOR SELECT
USING (true);

-- Authenticated users can vote (one vote per review per user)
DROP POLICY IF EXISTS "Authenticated users can vote on reviews" ON public.review_votes;
CREATE POLICY "Authenticated users can vote on reviews"
ON public.review_votes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.review_votes
    WHERE review_id = review_votes.review_id
    AND user_id = auth.uid()
  )
);

-- Users can update their own votes
DROP POLICY IF EXISTS "Users can update their own votes" ON public.review_votes;
CREATE POLICY "Users can update their own votes"
ON public.review_votes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.review_votes;
CREATE POLICY "Users can delete their own votes"
ON public.review_votes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- 7. COMMENTS POLICIES
-- =====================================================

-- Anyone can read published comments
DROP POLICY IF EXISTS "Published comments are viewable by everyone" ON public.comments;
CREATE POLICY "Published comments are viewable by everyone"
ON public.comments FOR SELECT
USING (
  status = 'published'
  OR author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  )
);

-- Authenticated users can create comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own comments
DROP POLICY IF EXISTS "Authors can update their own comments" ON public.comments;
CREATE POLICY "Authors can update their own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Moderators can update any comment
DROP POLICY IF EXISTS "Moderators can update any comment" ON public.comments;
CREATE POLICY "Moderators can update any comment"
ON public.comments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  )
);

-- Authors can delete their own comments
DROP POLICY IF EXISTS "Authors can delete their own comments" ON public.comments;
CREATE POLICY "Authors can delete their own comments"
ON public.comments FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Moderators can delete any comment
DROP POLICY IF EXISTS "Moderators can delete any comment" ON public.comments;
CREATE POLICY "Moderators can delete any comment"
ON public.comments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  )
);

-- =====================================================
-- 8. FAVORITES POLICIES
-- =====================================================

-- Users can only see their own favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can add favorites
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
CREATE POLICY "Users can add favorites"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can remove their favorites
DROP POLICY IF EXISTS "Users can remove favorites" ON public.favorites;
CREATE POLICY "Users can remove favorites"
ON public.favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- 9. REPORTS POLICIES
-- =====================================================

-- Moderators and admins can see all reports
DROP POLICY IF EXISTS "Moderators can view all reports" ON public.reports;
CREATE POLICY "Moderators can view all reports"
ON public.reports FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  )
);

-- Users can see their own reports
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- Authenticated users can create reports
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
CREATE POLICY "Authenticated users can create reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Only moderators and admins can update reports
DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;
CREATE POLICY "Moderators can update reports"
ON public.reports FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('moderator', 'admin')
  )
);

-- =====================================================
-- Migration Complete
-- =====================================================
-- All tables now have RLS enabled with appropriate policies
-- Next: Run 004_seed_reference_data.sql for sample data

