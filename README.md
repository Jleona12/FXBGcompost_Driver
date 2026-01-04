# FXBG Compost Driver PWA

A Progressive Web Application for FXBG Compost drivers to manage pickup routes, view customer information, and log pickup events.

## Features

- **Route Management**: View all available routes with metadata
- **Stop Details**: See customer info, addresses, phone numbers, and special instructions (flags)
- **Interactive Map**: Google Maps integration with markers for each stop
- **Pickup Logging**: Log pickups with driver initials, notes, and completion status
- **Offline Support**: Queue pickup events when offline, automatically sync when online
- **Contact Integration**: Click-to-call and click-to-text links for customer communication
- **PWA**: Installable on mobile devices, works offline

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Database**: Supabase (PostgreSQL)
- **Maps**: Google Maps JavaScript API
- **PWA**: next-pwa

## Project Structure

```
FXBGcompost_Driver/
├── app/
│   ├── layout.tsx              # Root layout with PWA meta tags
│   ├── page.tsx                # Start-up screen (route preview)
│   ├── route/[routeId]/
│   │   └── page.tsx            # Route detail view with stops
│   ├── api/
│   │   ├── routes/[routeId]/
│   │   │   └── route.ts        # GET stops for route
│   │   └── pickups/
│   │       └── route.ts        # POST pickup events
│   └── globals.css             # Global styles with FXBG brand colors
├── components/
│   ├── Header.tsx              # App header with logo
│   ├── RouteList.tsx           # Route preview list
│   ├── StopList.tsx            # List of stops for a route
│   ├── StopCard.tsx            # Individual stop card
│   ├── MapWidget.tsx           # Google Maps integration
│   ├── ContactWidget.tsx       # Phone/text links
│   ├── PickupLogger.tsx        # Logging interface
│   └── OfflineIndicator.tsx    # Offline status indicator
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Helper functions
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # PWA icons (to be added)
└── next.config.js              # Next.js config with PWA
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Maps API key

### Installation

1. Clone the repository:
```bash
cd /Users/jamesleonard/Documents/GitHub/FXBGcompost_Driver
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (copy from `.env.local.example`):
```bash
cp .env.local.example .env.local
```

4. Add your environment variables to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Database Setup

Your Supabase database should have the following tables:

#### `customers`
- `id` (uuid, primary key)
- `name` (text, required)
- `email` (text)
- `phone` (text)
- `address` (text)
- `stripe_customer_id` (text)
- `subscription_type` (enum: weekly, biweekly, monthly)
- `status` (enum: active, paused, cancelled)
- `notes` (text)
- `created_at` (timestamp)

#### `routes`
- `id` (uuid, primary key)
- `route_id` (text, unique, required)
- `date` (date)
- `notes` (text)
- `metadata` (jsonb)
- `created_at` (timestamp)

#### `stops`
- `id` (uuid, primary key)
- `route_id` (text, foreign key to routes.route_id)
- `customer_id` (uuid, foreign key to customers.id)
- `stop_order` (integer, required) - MUST be sequential (1, 2, 3...)
- `stop_type` (enum: pickup, delivery, both)
- `flags` (text[]) - Driver instructions like "long driveway", "gate code"
- `notes` (text)
- `created_at` (timestamp)

#### `pickup_events`
- `id` (uuid, primary key)
- `stop_id` (uuid, foreign key to stops.id)
- `driver_initials` (text, 2-3 characters, required)
- `notes` (text)
- `completion_status` (boolean, required)
- `created_at` (timestamp, auto-set)

### Running the App

Development mode:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Production build:
```bash
npm run build
npm start
```

## Key Implementation Details

### Database as Single Source of Truth
- **READ-ONLY** for customers, stops, and routes in the app
- All data is fetched dynamically from Supabase
- Never hard-code customer or route data

### Append-Only Pickup Events
- **NEVER update** previous pickup logs
- Always **INSERT** new rows into `pickup_events` table
- Each event includes:
  - `driver_initials` (validated: 2-3 characters)
  - `notes` (optional driver feedback)
  - `completion_status` (boolean)
  - `created_at` (auto-set by database)

### Stop Order Requirements
- `stop_order` must be sequential integers (1, 2, 3...)
- NO fractional values (e.g., 1.5, 2.3)
- Order stops by `stop_order ASC` in all queries

### Flags vs Notes
- **`stops.flags`**: Pre-set driver instructions (read-only, displayed as badges)
  - Examples: "long driveway", "gate code", "back door"
- **`pickup_events.notes`**: Driver-entered feedback during pickup
  - Examples: "no bucket", "left at door"

### Offline Mode
- Route & stop data cached for offline access
- Pickup events queued in localStorage when offline
- Automatic sync when connection restored
- Manual sync button available

### Driver Initials Validation
- Required for every pickup event
- Must be 2-3 alphanumeric characters
- Automatically converted to uppercase

## PWA Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"

## Customization

### Brand Colors
The app uses FXBG Compost brand colors defined in `tailwind.config.ts` and `app/globals.css`:

- **Primary Brown**: `#5D4037` (text)
- **Dark Brown**: `#3E2723` (headings)
- **Green**: `#2E7D32` (primary actions)
- **Medium Green**: `#4CAF50` (secondary elements)
- **Light Green**: `#81C784` (highlights)

### Logo/Icons
Replace placeholder icons in `/public/` with actual FXBG Compost branded icons:
- `favicon.ico` (16x16)
- `icon-192x192.png` (192x192 for PWA)
- `icon-512x512.png` (512x512 for PWA)

Generate PWA icons from the FXBG Compost logo using tools like:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Testing

### Test Dynamic Behavior
1. Add a customer in Supabase → Verify app reflects the change
2. Update stop order → Verify order changes in app
3. Add flags to a stop → Verify flags display correctly

### Test Pickup Logging
1. Log a pickup with driver initials
2. Verify timestamp and initials are saved in Supabase
3. Verify completion status is recorded

### Test Offline Mode
1. Disable network connection
2. Attempt to log a pickup → Should queue the event
3. Re-enable network → Should sync automatically
4. Verify event appears in Supabase

### Test on Mobile
1. Install PWA on mobile device
2. Test offline functionality
3. Test click-to-call and click-to-text links
4. Test map integration

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Critical Constraints

1. **Database is single source of truth** - Never hard-code data
2. **Append-only pickup events** - Never update previous logs
3. **Sequential stop orders** - Integer values only (1, 2, 3...)
4. **Read-only customer/stop data** - Drivers cannot modify
5. **Offline support is essential** - Must queue and sync events
6. **Driver initials validation** - 2-3 characters, alphanumeric

## Future Enhancements (Out of Scope for MVP)

- User authentication and driver accounts
- Messaging integration via `message_state` table
- Push notifications for route assignments
- Route optimization algorithms
- Analytics and reporting dashboard
- Photo uploads for pickup verification

## Support

For issues or questions, contact the development team.

## License

Proprietary - FXBG Compost
