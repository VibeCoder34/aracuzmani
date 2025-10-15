# Database Migration Guide - Reviews to Database

## Overview
Reviews are now stored in the Supabase database instead of localStorage. This ensures data persistence across devices and allows all users to see each other's reviews.

## What Changed

### Before
- ❌ Reviews stored in browser localStorage
- ❌ Reviews only visible to the user who wrote them
- ❌ Reviews lost when clearing browser data
- ❌ No cross-device sync

### After
- ✅ Reviews stored in Supabase PostgreSQL database
- ✅ Reviews visible to all users
- ✅ Reviews persist across all browsers and devices
- ✅ Proper authentication and authorization

## Files Changed

### New Files Created
1. `db/migrations/005_add_car_id_to_reviews.sql` - Migration to add car_id field
2. `src/app/api/reviews/route.ts` - API routes for GET and POST reviews
3. `src/app/api/reviews/[id]/vote/route.ts` - API route for voting on reviews

### Modified Files
1. `src/lib/store.ts` - Removed localStorage persistence, simplified to client-side state only
2. `src/app/cars/[slug]/page.tsx` - Fetch reviews from API, submit reviews to database
3. `src/components/review/review-item.tsx` - Use database API for helpful votes
4. `src/components/review/review-form.tsx` - Added disabled state for submission
5. `src/app/profile/page.tsx` - Fetch user reviews from database

## Migration Steps

### Step 1: Run the Database Migration

You need to run the new migration file on your Supabase database:

**Option A: Using Supabase CLI (Recommended)**
```bash
# Make sure you're logged in to Supabase CLI
supabase db push

# Or apply the specific migration
supabase db push --db-url "your-database-url" db/migrations/005_add_car_id_to_reviews.sql
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `db/migrations/005_add_car_id_to_reviews.sql`
4. Paste and execute it

**Option C: Using psql**
```bash
psql "your-database-connection-string" -f db/migrations/005_add_car_id_to_reviews.sql
```

### Step 2: Clear localStorage (Optional but Recommended)

Since we're moving away from localStorage, users should clear their browser storage:

```javascript
// Run this in browser console on your app
localStorage.removeItem('review-storage');
localStorage.removeItem('auth-storage');
console.log('✅ LocalStorage cleared');
```

### Step 3: Test the System

1. **Test Review Creation:**
   - Log in to your application
   - Navigate to any car detail page
   - Click "Yorum Ekle" (Add Review)
   - Fill out the review form
   - Submit
   - Verify the review appears immediately
   - Refresh the page - review should still be there

2. **Test Review Viewing:**
   - Open the same car page in an incognito window
   - You should see the review you just created
   - Reviews are now visible to everyone

3. **Test Helpful Votes:**
   - Log in with a different account
   - Click the "Faydalı" button on a review
   - The count should increase
   - Click again to remove your vote
   - The count should decrease

4. **Test Profile Page:**
   - Go to your profile page
   - You should see all your reviews listed
   - They should be fetched from the database

## API Endpoints

### GET /api/reviews
Fetch all reviews or filter by car

**Query Parameters:**
- `carId` (optional): Filter reviews for specific car

**Response:**
```json
{
  "reviews": [
    {
      "id": "123",
      "carId": "toyota-camry-2024",
      "userId": "user-uuid",
      "text": "Great car!",
      "ratings": { "comfort": 5, "drive": 4, ... },
      "overall": 4.5,
      "helpfulCount": 10,
      "createdAt": "2025-01-01T00:00:00Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

### POST /api/reviews
Create a new review (requires authentication)

**Request Body:**
```json
{
  "carId": "toyota-camry-2024",
  "text": "Great car!",
  "ratings": {
    "comfort": 5,
    "drive": 4,
    "fuelEconomy": 4,
    "reliability": 5,
    "maintenance": 4,
    "interior": 5,
    "tech": 4,
    "resale": 4
  }
}
```

**Response:**
```json
{
  "review": { ... }
}
```

### POST /api/reviews/[id]/vote
Toggle helpful vote on a review (requires authentication)

**Response:**
```json
{
  "success": true,
  "action": "added", // or "removed"
  "helpfulCount": 11
}
```

### GET /api/reviews/[id]/vote
Check if current user has voted on a review

**Response:**
```json
{
  "hasVoted": true
}
```

## Database Schema

The migration adds/modifies these fields in the `reviews` table:

```sql
- car_id TEXT (new) - stores the car slug from frontend
- trim_id BIGINT (made nullable) - original normalized foreign key
```

This allows the frontend to work with simple car IDs while keeping the normalized database structure for future use.

## Troubleshooting

### Issue: Reviews not showing up
**Solution:** Make sure the migration was run successfully. Check your Supabase logs.

### Issue: "Unauthorized" error when submitting review
**Solution:** Make sure the user is logged in. Check authentication state.

### Issue: RLS policy blocking requests
**Solution:** Verify that Row Level Security policies are properly configured in `db/migrations/003_rls_policies.sql`

### Issue: Profile reviews not loading
**Solution:** Check the browser console for API errors. Verify the `/api/reviews` endpoint is working.

## Next Steps

1. ✅ Run the migration
2. ✅ Test review creation
3. ✅ Test review fetching
4. ✅ Test helpful votes
5. ✅ Clear old localStorage data

## Notes

- Old localStorage reviews are not automatically migrated. Users will start fresh with database reviews.
- If you want to migrate old localStorage reviews, you'll need to create a custom migration script.
- The Zustand store now only manages client-side state, not persistence.
- All reviews are marked as 'published' by default. You can add moderation later.

## Support

If you encounter any issues:
1. Check Supabase logs in the dashboard
2. Check browser console for errors
3. Verify authentication is working properly
4. Make sure environment variables are set correctly

