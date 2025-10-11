# Complete File Tree

```
aracuzmani/
├── README.md                           # Comprehensive project documentation
├── SETUP.md                            # Quick setup and testing guide
├── FILE_TREE.md                        # This file
├── package.json                        # Dependencies (with Zustand added)
├── package-lock.json
├── next.config.ts                      # Next.js configuration
├── tsconfig.json                       # TypeScript config with @/ path alias
├── postcss.config.mjs                  # PostCSS configuration
├── eslint.config.mjs                   # ESLint configuration
├── components.json                     # shadcn/ui configuration
│
├── types/                              # TypeScript type definitions
│   └── car.ts                          # Car, Review, User, RatingCategory types
│
├── mock/                               # Mock data (JSON files)
│   ├── cars.json                       # 15 mock cars
│   ├── reviews.json                    # 12 mock reviews
│   └── users.json                      # 6 mock users
│
├── public/                             # Static assets
│   ├── manifest.json                   # PWA manifest
│   ├── sw.js                           # Service worker (placeholder)
│   ├── icon-192.png                    # PWA icon (placeholder)
│   ├── icon-512.png                    # PWA icon (placeholder)
│   ├── favicon.ico                     # Browser favicon
│   ├── cars/                           # Car images (placeholders)
│   │   ├── placeholder.svg
│   │   ├── camry-1.jpg ... camry-3.jpg
│   │   ├── accord-1.jpg ... accord-2.jpg
│   │   ├── model3-1.jpg ... model3-3.jpg
│   │   ├── f150-1.jpg ... f150-2.jpg
│   │   ├── cx5-1.jpg ... cx5-3.jpg
│   │   ├── x5-1.jpg ... x5-2.jpg
│   │   ├── ioniq5-1.jpg ... ioniq5-3.jpg
│   │   ├── corvette-1.jpg ... corvette-2.jpg
│   │   ├── outback-1.jpg ... outback-3.jpg
│   │   ├── a4-1.jpg ... a4-2.jpg
│   │   ├── rx-1.jpg ... rx-3.jpg
│   │   ├── 911-1.jpg ... 911-2.jpg
│   │   ├── telluride-1.jpg ... telluride-3.jpg
│   │   ├── id4-1.jpg ... id4-2.jpg
│   │   └── rogue-1.jpg ... rogue-3.jpg
│   └── avatars/                        # User avatars (placeholders)
│       ├── sarah.jpg
│       ├── michael.jpg
│       ├── emily.jpg
│       ├── jessica.jpg
│       └── demo.jpg
│
└── src/
    ├── app/                            # Next.js App Router pages
    │   ├── layout.tsx                  # Root layout with headers, providers
    │   ├── page.tsx                    # Home page (/)
    │   ├── globals.css                 # Global styles & CSS variables
    │   ├── favicon.ico
    │   ├── cars/                       # Cars routes
    │   │   ├── page.tsx                # Browse page (/cars)
    │   │   └── [slug]/                 # Dynamic car detail
    │   │       └── page.tsx            # Car detail page (/cars/[slug])
    │   ├── compare/                    # Compare page
    │   │   └── page.tsx                # Compare page (/compare)
    │   ├── profile/                    # User profile page
    │   │   └── page.tsx                # Profile page (/profile)
    │   ├── highlights/                 # Weekly highlights
    │   │   └── page.tsx                # Highlights page (/highlights)
    │   └── auth/                       # Authentication
    │       └── page.tsx                # Mock auth page (/auth)
    │
    ├── components/                     # React components
    │   ├── ui/                         # Base UI components (shadcn-style)
    │   │   ├── button.tsx              # Button with variants
    │   │   ├── card.tsx                # Card with header/content/footer
    │   │   ├── input.tsx               # Text input
    │   │   ├── textarea.tsx            # Textarea
    │   │   ├── label.tsx               # Form label
    │   │   ├── badge.tsx               # Badge with variants
    │   │   ├── avatar.tsx              # Avatar with image/fallback
    │   │   ├── progress.tsx            # Progress bar
    │   │   ├── tabs.tsx                # Tabs component
    │   │   ├── dialog.tsx              # Modal dialog
    │   │   └── star-rating.tsx         # Accessible star rating component
    │   │
    │   ├── car/                        # Car-specific components
    │   │   ├── card-car.tsx            # Car card for listings
    │   │   ├── car-spec-table.tsx      # Specs table
    │   │   └── car-avg-badges.tsx      # Category average badges
    │   │
    │   ├── review/                     # Review components
    │   │   ├── review-item.tsx         # Single review display
    │   │   └── review-form.tsx         # Add review form
    │   │
    │   ├── layout/                     # Layout components
    │   │   ├── app-header.tsx          # Header with nav & user menu
    │   │   ├── app-footer.tsx          # Footer with links
    │   │   └── mobile-tabbar.tsx       # Bottom tab bar (mobile)
    │   │
    │   ├── search/                     # Search & filter components
    │   │   └── filter-sheet.tsx        # Filter sidebar/drawer
    │   │
    │   ├── pwa/                        # PWA components
    │   │   └── install-banner.tsx      # Install app banner
    │   │
    │   └── common/                     # Shared/utility components
    │       ├── empty-state.tsx         # Empty state display
    │       └── loading-spinner.tsx     # Loading spinner
    │
    └── lib/                            # Utilities & helpers
        ├── cn.ts                       # Class name utility (tweakcn)
        ├── store.ts                    # Zustand stores (auth, reviews)
        ├── formatters.ts               # en-US date/number formatters
        └── rating-helpers.ts           # Rating calculations
```

## File Counts

- **Pages**: 7 (Home, Browse, Detail, Compare, Profile, Highlights, Auth)
- **Components**: 25+ reusable components
- **Mock Data Files**: 3 (cars, reviews, users)
- **Utilities**: 4 helper libraries
- **Total TypeScript Files**: ~40
- **Placeholder Images**: ~40 car images, 5 avatar images

## Key Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand (with localStorage persistence)
- **Icons**: lucide-react
- **UI Pattern**: shadcn/ui inspired components
- **Locale**: en-US (all dates, numbers, text)

## Routes Map

| URL | Page | Description |
|-----|------|-------------|
| `/` | Home | Hero, trending, top-rated cars |
| `/cars` | Browse | Filterable car catalog |
| `/cars/[slug]` | Car Detail | Specs, reviews, image gallery |
| `/compare` | Compare | Side-by-side comparison (up to 3) |
| `/profile` | Profile | User reviews, stats, insights |
| `/highlights` | Highlights | Weekly trends & top-rated |
| `/auth` | Auth | Mock sign-in (instant) |

## Data Flow

1. **Mock Data** (JSON files) → imported into pages
2. **Zustand Stores** → manage auth & reviews state
3. **localStorage** → persist user session & reviews
4. **Components** → receive data via props
5. **Formatters** → convert dates/numbers to en-US format

## PWA Features

- ✅ Web app manifest (`/manifest.json`)
- ✅ Service worker (`/sw.js`)
- ✅ Install banner (iOS & Android instructions)
- ✅ Theme color & icons
- ✅ Standalone display mode

## Mobile-First Design

- Bottom tab navigation (`MobileTabBar`)
- Filter drawer (swipe from side)
- Responsive grid layouts
- Touch-friendly button sizes (min 44px)
- Optimized for 360px+ width

## Accessibility Features

- Keyboard navigation (Tab, Enter, Space)
- ARIA labels on all interactive elements
- Screen reader support
- Focus indicators (ring-2)
- Semantic HTML (header, nav, main, footer)
- Color contrast (WCAG AA)

---

**Total Lines of Code**: ~3,500+ lines across all files
**Development Time**: Full MVP ready to run
**Dependencies**: Minimal (Next.js, React, Tailwind, Zustand, lucide-react)

