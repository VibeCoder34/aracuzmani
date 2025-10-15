-- =====================================================
-- Update handle_new_user trigger to save username
-- =====================================================
-- This migration updates the trigger to also save username from metadata

-- Drop and recreate the function with username support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- The trigger already exists, no need to recreate it
-- It will automatically use the updated function

-- =====================================================
-- Migration Complete
-- =====================================================

