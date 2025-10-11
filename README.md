# CarReviews - Car Review Platform MVP

A modern, mobile-first car review platform built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🚗 **Car Catalog**: Browse and filter cars by brand, year, body type, fuel, transmission
- ⭐ **Reviews System**: 8-category rating system (Comfort, Drive, Fuel Economy, Reliability, Maintenance, Interior, Tech, Resale)
- 🔍 **Search & Filter**: Advanced filtering with URL params
- 📊 **Compare**: Side-by-side comparison of up to 3 cars
- 👤 **User Profiles**: Track reviews, stats, and insights
- 📱 **Mobile-First**: Responsive design with bottom navigation
- 🌐 **PWA Ready**: Install banner and offline capabilities
- 🎨 **Theme System**: Based on CSS variables for easy customization
- ♿ **Accessible**: WCAG compliant, keyboard navigation, ARIA labels

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (custom implementation)
- **Icons**: lucide-react
- **State Management**: Zustand
- **Forms**: react-hook-form + zod (ready for integration)
- **Locale**: en-US (dates, numbers, currency)

## Getting Started

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Home page
│   │   ├── cars/            # Cars catalog & detail
│   │   ├── compare/         # Compare page
│   │   ├── profile/         # User profile
│   │   ├── highlights/      # Weekly highlights
│   │   └── auth/            # Mock authentication
│   ├── components/          # React components
│   │   ├── ui/              # Base UI components
│   │   ├── car/             # Car-specific components
│   │   ├── review/          # Review components
│   │   ├── layout/          # Layout components
│   │   ├── search/          # Search & filter
│   │   ├── pwa/             # PWA install banner
│   │   └── common/          # Shared components
│   └── lib/                 # Utilities & helpers
│       ├── cn.ts            # Class name utility
│       ├── store.ts         # Zustand stores
│       ├── formatters.ts    # Date/number formatters
│       └── rating-helpers.ts # Rating calculations
├── types/                   # TypeScript types
│   └── car.ts               # Car, Review, User types
├── mock/                    # Mock data (JSON)
│   ├── cars.json            # 15 mock cars
│   ├── reviews.json         # 12 mock reviews
│   └── users.json           # 6 mock users
└── public/                  # Static assets
    ├── manifest.json        # PWA manifest
    ├── sw.js                # Service worker
    └── icon-*.png           # PWA icons
```

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with trending & top-rated cars |
| `/cars` | Browse all cars with filters |
| `/cars/[slug]` | Car detail with specs, reviews, stats |
| `/compare` | Compare up to 3 cars side-by-side |
| `/profile` | User profile with reviews & insights |
| `/highlights` | Weekly highlights & trending models |
| `/auth` | Mock authentication (email & Google) |

## Mock Data

All data is stored in JSON files under `/mock/`:

- **15 cars** covering various brands, body types, and fuel types
- **12 reviews** with 8-category ratings
- **6 users** with profiles and avatars

### Mock Authentication

Clicking "Sign In" immediately creates a fake user and persists to localStorage via Zustand. No backend required.

## Key Components

### Star Rating
Accessible, keyboard-navigable star rating component with ARIA labels.

```tsx
<StarRating value={4.5} readonly size="md" showValue />
```

### Car Card
Displays car with image, ratings, and review count.

```tsx
<CarCard car={car} averageRating={4.2} reviewCount={8} />
```

### Review Form
8-category rating form with validation.

```tsx
<ReviewForm onSubmit={handleSubmit} onCancel={handleCancel} />
```

### Filter Sheet
Advanced filtering with badges and inputs.

```tsx
<FilterSheet 
  filters={filters} 
  onFilterChange={handleChange} 
  onClearFilters={clearAll} 
/>
```

## Integrating a Real Backend

To connect this MVP to a real backend:

1. **Replace Mock Data**:
   - Remove `/mock/*.json` files
   - Create API routes in `/app/api/`
   - Use `fetch` or `axios` to call your backend

2. **Update Zustand Stores** (`/src/lib/store.ts`):
   - Replace local state with API calls
   - Add loading/error states
   - Implement optimistic updates

3. **Authentication**:
   - Integrate NextAuth.js or Auth0
   - Replace `mockSignIn` with real OAuth flow
   - Add JWT/session management

4. **Forms & Validation**:
   - Add `react-hook-form` + `zod` for robust validation
   - Connect to POST endpoints
   - Handle server-side errors

5. **Image Uploads**:
   - Use `next/image` with remote sources
   - Integrate Cloudinary or S3 for car images
   - Add upload UI for user avatars

6. **Search & Filters**:
   - Implement server-side pagination
   - Add debounced search API calls
   - Use query params for sharing filtered URLs

7. **Real-time Updates**:
   - Use WebSockets or Server-Sent Events
   - Implement SWR or React Query for data fetching
   - Add polling for review counts

8. **SEO**:
   - Generate dynamic metadata for car pages
   - Add JSON-LD structured data
   - Implement sitemap generation

9. **PWA**:
   - Use `next-pwa` or Workbox
   - Implement offline caching strategies
   - Add background sync for reviews

10. **Analytics**:
    - Integrate Google Analytics or Posthog
    - Track user interactions
    - Monitor Core Web Vitals

## Accessibility

- ✅ Full keyboard navigation
- ✅ ARIA labels on interactive elements
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ Semantic HTML
- ✅ Minimum text size: 14px
- ✅ WCAG AA contrast ratios

## Mobile-First Design

- Responsive from 360px width
- Bottom tab navigation on mobile
- Touch-friendly targets (min 44px)
- Optimized for one-handed use
- Filter drawer on mobile

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+
- iOS Safari 14+
- Android Chrome (latest)

## License

MIT

## Notes

- All UI copy is in English (en-US)
- Dates formatted with `Intl.DateTimeFormat('en-US')`
- Numbers formatted with `Intl.NumberFormat('en-US')`
- Theme based on CSS variables in `globals.css`
- No backend or API routes (UI-only MVP)

---

Built with ❤️ using Next.js
