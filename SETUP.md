# Setup Instructions

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What's Included

✅ **Complete UI-only MVP** - No backend required
✅ **Mock Data** - 15 cars, 12 reviews, 6 users in JSON files
✅ **Mock Auth** - Click sign-in to instantly create a fake user
✅ **State Management** - Zustand with localStorage persistence
✅ **PWA Ready** - Manifest and service worker for installable app
✅ **Mobile-First** - Responsive design with bottom tab navigation
✅ **Accessible** - WCAG compliant with keyboard navigation

## Key Features to Test

### 1. Browse Cars
- Go to `/cars` to see the catalog
- Use filters: brand, year, body type, fuel, transmission
- Search for specific makes/models

### 2. Car Detail
- Click any car card to view details
- See image gallery, specs, and reviews
- Tab between Overview, Reviews, and Stats

### 3. Add Review (requires sign-in)
- Click "Add Review" on any car detail page
- Rate 8 categories (1-5 stars each)
- Write review text
- Submit to see it appear immediately

### 4. Compare Cars
- Go to `/compare`
- Add up to 3 cars
- View side-by-side comparison (desktop) or stacked cards (mobile)

### 5. User Profile
- Sign in at `/auth` (instant mock sign-in)
- View your reviews, stats, and insights at `/profile`
- Sign out to clear mock session

### 6. Weekly Highlights
- Go to `/highlights`
- See most reviewed, top-rated, and rising star cars

### 7. PWA Installation
- On mobile, you'll see an install banner
- Add to home screen for app-like experience

## Project Structure

```
src/
├── app/                  # Pages (Next.js App Router)
├── components/          # React components
│   ├── ui/              # Base UI components
│   ├── car/             # Car-specific components
│   ├── review/          # Review components
│   ├── layout/          # Header, footer, mobile tab bar
│   ├── search/          # Filter sheet
│   └── pwa/             # Install banner
├── lib/                 # Utilities & state
│   ├── cn.ts            # Class name utility (tweakcn)
│   ├── store.ts         # Zustand stores (auth, reviews)
│   ├── formatters.ts    # Date/number formatters (en-US)
│   └── rating-helpers.ts # Rating calculations
types/                   # TypeScript types
mock/                    # Mock data (JSON)
public/                  # Static assets (PWA, images)
```

## Mock Data Location

- **Cars**: `/mock/cars.json`
- **Reviews**: `/mock/reviews.json`
- **Users**: `/mock/users.json`

Edit these files to add more mock data!

## State Management

### Auth Store
Located in `src/lib/store.ts`:
- `user`: Current signed-in user (or null)
- `setUser(user)`: Set current user
- `signOut()`: Clear user session

Persisted to localStorage as `auth-storage`.

### Review Store
Located in `src/lib/store.ts`:
- `reviews`: Array of all reviews
- `addReview(review)`: Add a new review
- `getReviewsForCar(carId)`: Get reviews for specific car

Persisted to localStorage as `review-storage`.

## Theme Customization

All colors are defined in `src/app/globals.css` using CSS variables:

```css
:root {
  --primary: oklch(...);
  --secondary: oklch(...);
  /* etc */
}
```

Update these values to change the entire theme!

## Mobile Testing

Best viewed on:
- Chrome DevTools (mobile emulation)
- Actual mobile device
- Minimum width: 360px

Key mobile features:
- Bottom tab navigation
- Filter drawer (swipe from right)
- Touch-friendly targets
- Optimized images

## Build for Production

```bash
npm run build
npm run start
```

## Troubleshooting

### "Module not found" errors
Run `npm install` to ensure all dependencies are installed.

### Images not loading
Placeholder images are in `/public/cars/` and `/public/avatars/`.
For production, replace with real images.

### State not persisting
Check browser localStorage. Clear it if needed:
```js
localStorage.clear()
```

### PWA not installing
- PWA requires HTTPS in production
- Test on localhost or use ngrok
- Check manifest.json and service worker

## Next Steps

See `README.md` for how to integrate a real backend!

---

Built with Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui

