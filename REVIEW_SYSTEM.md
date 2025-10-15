# Review System Documentation

## Overview
The review functionality is now fully functional using a hybrid approach with mock data and real user authentication.

## How It Works

### 1. Mock Data Setup
- **Mock Users** (`/mock/users.json`): Contains 7 pre-defined users (u1-u6, and mock-user-1)
- **Mock Reviews** (`/mock/reviews.json`): Contains 17 sample reviews for various cars
- All mock reviews are linked to mock users by their IDs

### 2. Authentication Flow
- Real authentication is handled by **Supabase**
- When a user logs in via Supabase (email/password, magic link, or Google OAuth), their session is maintained
- The car detail page checks Supabase authentication state to determine if a user can submit reviews

### 3. Review Submission
When a logged-in user submits a review:
1. The form captures review text and 8 category ratings (comfort, drive, fuel economy, etc.)
2. An overall rating is calculated as the average of all 8 categories
3. The review is stored in Zustand store with localStorage persistence
4. User data (name, avatar, email) is cached alongside the review for display purposes

### 4. Review Display
- All reviews (both mock and real) are displayed on car detail pages
- Mock reviews show mock user information
- Real user reviews show actual Supabase user information
- The `getUserById()` function handles both mock and real users seamlessly

### 5. Review Features

#### Star Ratings
- Each review has 8 category ratings: comfort, drive, fuelEconomy, reliability, maintenance, interior, tech, resale
- Overall rating is calculated and displayed
- Read-only star ratings are shown for existing reviews
- Interactive star ratings are shown in the review form

#### Helpful Button
- Users can mark reviews as helpful
- Helpful count is tracked and persisted
- Users can toggle their "helpful" mark

#### Sorting
- Reviews can be sorted by "newest" or "highest rating"
- Sorting is available on the Reviews tab

#### Category Averages
- Car detail pages show average ratings across all categories
- Displayed as badges with color-coded ratings
- Shown on both Overview and Stats tabs

## Technical Implementation

### Store Structure (`src/lib/store.ts`)
```typescript
type ReviewStore = {
  reviews: Review[];                    // All reviews (mock + real)
  helpfulReviews: Set<string>;         // Track which reviews user marked helpful
  realUsers: Record<string, User>;      // Cache real Supabase users
  addReview: (review, userData?) => void;
  getReviewsForCar: (carId) => Review[];
  markReviewHelpful: (reviewId) => void;
  isReviewMarkedHelpful: (reviewId) => boolean;
}
```

### Review Component Flow
1. **Car Detail Page** (`/cars/[slug]/page.tsx`)
   - Fetches Supabase user session
   - Filters reviews for current car
   - Calculates category averages
   - Handles review submission with user data caching

2. **Review Form** (`/components/review/review-form.tsx`)
   - 8 category ratings (default 3 stars each)
   - Text area for review content
   - Form validation
   - Submission callback

3. **Review Item** (`/components/review/review-item.tsx`)
   - Displays user avatar and name
   - Shows overall rating and timestamp
   - Shows detailed category ratings with progress bars
   - Helpful button with count

## Data Persistence
- Reviews are persisted in localStorage via Zustand persist middleware
- Survives page refreshes and browser restarts
- Real user data is cached to ensure proper display of their reviews

## Testing the Review System

### Without Supabase Login (View Only)
- Browse to any car detail page (e.g., `/cars/toyota-camry-2024`)
- View existing mock reviews
- See category averages and ratings
- Cannot submit new reviews

### With Supabase Login (Full Functionality)
1. Sign up or log in via `/login` or `/signup`
2. Navigate to any car detail page
3. Click "Yorum Ekle" (Add Review) button
4. Fill out the review form with:
   - Review text (required)
   - 8 category ratings (default 3 stars)
5. Click "Yorumu Gönder" (Submit Review)
6. Your review appears immediately in the reviews list
7. Your user information is displayed with the review

### Review Features to Test
- ✅ Submit reviews with different ratings
- ✅ Mark reviews as helpful
- ✅ Sort reviews by newest/highest rating
- ✅ View category averages on Overview and Stats tabs
- ✅ View reviews across different cars
- ✅ Test persistence (refresh page, reviews remain)

## File Structure
```
src/
├── app/cars/[slug]/page.tsx          # Car detail page with reviews
├── components/
│   ├── review/
│   │   ├── review-form.tsx           # Review submission form
│   │   └── review-item.tsx           # Individual review display
│   └── car/
│       └── car-avg-badges.tsx        # Category averages display
├── lib/
│   └── store.ts                      # Zustand store (reviews + auth)
└── types/car.ts                      # TypeScript types

mock/
├── users.json                        # Mock user data
└── reviews.json                      # Mock review data
```

## Future Enhancements
When you're ready to move from mock data to real database:
1. Create `reviews` table in Supabase
2. Update `addReview` to save to Supabase instead of localStorage
3. Fetch reviews from Supabase on page load
4. Join with `profiles` table for user information
5. Add RLS policies for review submission and updates
6. Add edit/delete functionality for own reviews

## Notes
- Mock data is great for testing and demonstration
- Real Supabase authentication is already integrated
- Reviews persist in browser localStorage
- System handles both mock and real users seamlessly
- No database required for current implementation

