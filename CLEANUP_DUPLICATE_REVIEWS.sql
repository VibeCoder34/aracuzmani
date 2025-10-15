-- =====================================================
-- Cleanup Duplicate Reviews Script
-- =====================================================
-- This script helps identify and remove duplicate reviews
-- Run this in your Supabase SQL Editor

-- Step 1: Check for potential duplicates
-- Look for reviews with same author_id, car_id, and body
SELECT 
  author_id,
  car_id,
  body,
  COUNT(*) as duplicate_count,
  array_agg(id) as review_ids,
  array_agg(created_at) as created_dates
FROM public.reviews 
WHERE car_id IS NOT NULL
GROUP BY author_id, car_id, body
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Show all reviews for a specific user (replace 'YOUR_USER_ID' with actual ID)
-- This helps you see what reviews exist for debugging
SELECT 
  id,
  author_id,
  car_id,
  body,
  avg_score,
  created_at,
  status
FROM public.reviews 
WHERE author_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;

-- Step 3: Remove duplicates (KEEP the most recent one)
-- WARNING: This will delete duplicate reviews, keeping only the newest one
-- Uncomment and run ONLY after reviewing the results above

/*
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY author_id, car_id, body 
      ORDER BY created_at DESC
    ) as rn
  FROM public.reviews
  WHERE car_id IS NOT NULL
)
DELETE FROM public.reviews 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
*/

-- Step 4: Verify cleanup worked
-- Run this after cleanup to confirm no more duplicates
SELECT 
  author_id,
  car_id,
  body,
  COUNT(*) as count
FROM public.reviews 
WHERE car_id IS NOT NULL
GROUP BY author_id, car_id, body
HAVING COUNT(*) > 1;

-- Step 5: Check total review count by user
SELECT 
  author_id,
  COUNT(*) as total_reviews,
  COUNT(DISTINCT car_id) as unique_cars_reviewed
FROM public.reviews 
WHERE car_id IS NOT NULL
GROUP BY author_id
ORDER BY total_reviews DESC;
