-- =====================================================
-- Sample Users for Development
-- =====================================================
-- NOTE: Users must be created through Supabase Auth UI or API
-- This file documents the test users and creates profile extensions
-- for users that have already been created via auth.users

-- =====================================================
-- How to create test users:
-- =====================================================
-- 1. Via Supabase Dashboard:
--    Authentication > Users > Add user
--    - Email: test@example.com
--    - Password: Test123!@#
--    - Auto Confirm User: Yes
--
-- 2. Via API/Frontend:
--    Use the signup flow in your app
--
-- 3. Get the UUID from auth.users and insert profiles manually if needed
-- =====================================================

-- Sample profile data (assumes users already exist in auth.users)
-- Replace UUIDs with actual user IDs from your auth.users table

-- Example: If you have created users via Dashboard, update their profiles:
-- UPDATE public.profiles 
-- SET 
--   username = 'demo_user',
--   full_name = 'Demo Kullanıcı',
--   bio = 'Test kullanıcısı - geliştirme amaçlı'
-- WHERE id = 'YOUR-USER-UUID-HERE';

-- For moderator role:
-- UPDATE public.profiles 
-- SET role = 'moderator'
-- WHERE id = 'YOUR-MODERATOR-UUID-HERE';

-- For admin role:
-- UPDATE public.profiles 
-- SET role = 'admin'
-- WHERE id = 'YOUR-ADMIN-UUID-HERE';

-- =====================================================
-- Quick Test User Creation Guide
-- =====================================================
-- 1. Sign up via /signup page
-- 2. Check email for confirmation (or auto-confirm in Dashboard)
-- 3. Profile row is auto-created via trigger
-- 4. Update username and other fields via /profile page

