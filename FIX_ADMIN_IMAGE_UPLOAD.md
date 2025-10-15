# Fix: Admin Image Upload - RLS Policy Error

## Problem
When admins try to upload car images in the admin panel, they get this error:
```
Failed to upload image: new row violates row-level security policy
```

## Root Cause
The storage bucket policies only allow users to upload images to folders matching their user ID. Admins need permission to upload car images to the `review-images/cars/` folder.

## Solution

### Step 1: Run the Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `db/migrations/008_admin_storage_policies.sql`
5. Click **Run**

Or you can copy this SQL directly:

```sql
-- Allow admins to upload car images to the "cars/" folder
DROP POLICY IF EXISTS "Admins can upload car images" ON storage.objects;
CREATE POLICY "Admins can upload car images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images' 
  AND (storage.foldername(name))[1] = 'cars'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Allow admins to update car images
DROP POLICY IF EXISTS "Admins can update car images" ON storage.objects;
CREATE POLICY "Admins can update car images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = 'cars'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
)
WITH CHECK (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = 'cars'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);

-- Allow admins to delete car images
DROP POLICY IF EXISTS "Admins can delete car images" ON storage.objects;
CREATE POLICY "Admins can delete car images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = 'cars'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('moderator', 'admin')
  )
);
```

### Step 2: Verify Your Admin Role

Make sure your user account has the `admin` or `moderator` role:

1. Go to **Supabase Dashboard** → **Table Editor**
2. Open the `profiles` table
3. Find your user record
4. Check that the `role` column is set to `'admin'` or `'moderator'`

If not, you can update it:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

Or use the script:
```bash
node scripts/make-admin.js YOUR_EMAIL
```

### Step 3: Test the Upload

1. Go to `/admin` in your app
2. Click on the **Upload Images** tab
3. Enter a car slug (e.g., `toyota-corolla-2024`)
4. Upload an image
5. It should now work! ✅

## What This Fix Does

The new policies allow users with `admin` or `moderator` roles to:
- ✅ Upload images to `review-images/cars/` folder
- ✅ Update images in `review-images/cars/` folder
- ✅ Delete images from `review-images/cars/` folder

Regular users can still only upload to their own folders (like before).

## Verification

After running the migration, you can verify the policies exist:

```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%car images%';
```

You should see:
- `Admins can upload car images`
- `Admins can update car images`
- `Admins can delete car images`

## Troubleshooting

### Still getting the error?
1. **Clear your browser cache** and reload
2. **Check your role**: Make sure your user has `admin` or `moderator` role
3. **Check authentication**: Make sure you're logged in
4. **Verify the migration ran**: Check the SQL output for any errors

### Policy conflict errors?
The migration uses `DROP POLICY IF EXISTS` to safely replace existing policies. If you still get conflicts, manually drop the policies:

```sql
DROP POLICY IF EXISTS "Admins can upload car images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update car images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete car images" ON storage.objects;
```

Then run the migration again.

---

**Created:** October 15, 2025
**Status:** Ready to Apply

