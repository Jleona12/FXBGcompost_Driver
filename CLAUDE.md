# FXBG Compost Driver — V2

Mobile-first web app for managing compost pickup routes in Fredericksburg, VA.

## Quick Reference

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build (also validates TypeScript)
npm run lint     # ESLint check
npm run start    # Start production server
```

## Architecture

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Database:** Supabase (PostgreSQL)
- **UI:** Tailwind CSS + Shadcn/UI (Radix primitives) + Lucide icons
- **Deployment:** Vercel

### Key Architecture Decision: Direct Supabase Queries

The driver-facing pages query Supabase **directly from the browser** — no API routes in between. This eliminates all caching layers (Next.js server cache, Vercel CDN, service workers) that previously caused stale data issues.

- **Driver pages:** `supabase.from('table').select(...)` directly in React components
- **Admin pages:** Fetch via Next.js API routes (`/api/admin/*`) protected by middleware
- **Realtime:** Driver dashboard subscribes to Supabase Realtime for instant updates

## Project Structure

```
app/
  (driver)/              # Driver-facing route group (public, no auth)
    page.tsx             # Route list dashboard (queries Supabase directly)
    route/[routeId]/     # Pickup execution flow (queries Supabase directly)
  admin/                 # Admin dashboard (password-protected)
    customers/           # Customer management
    templates/           # Route template CRUD + stop ordering
    pickups/             # Pickup event history
  api/
    v2-pickups/          # Pickup event creation (public, used by driver + offline sync)
    instance-stops/      # Driver notes update (public)
    admin/               # Admin CRUD API (auth required via middleware)
      auth/              # Login/logout/status
      templates/         # Template CRUD, send-to-driver, copy
      instances/         # Active route management, stop management
      customers/         # Customer CRUD
      pickup-events/     # Pickup history queries
components/
  ui/                    # Shadcn primitives (don't edit directly)
  admin/                 # Admin-specific components (SortableStopCard, SortableStopList)
  RouteList.tsx          # Driver dashboard — direct Supabase + Realtime subscription
  StopList.tsx           # Driver stop list with drag-reorder
  StopDetail.tsx         # Individual stop with pickup logging
  StopCard.tsx           # Stop card for driver view
  InitialsPrompt.tsx     # Driver initials entry before starting route
  CacheBuster.tsx        # One-time cache clear on deploy (kills old service workers)
  OfflineIndicator.tsx   # Offline status bar + queued event sync
lib/
  supabase.ts            # Supabase client (singleton, works in browser + server)
  types.ts               # All TypeScript interfaces (mirrors V2 DB schema)
  utils.ts               # Helpers: validation, formatting, offline queue, timezone
  data/                  # Data access functions for admin pages (fetch via API routes)
    templates.ts         # Template CRUD + send/copy
    instances.ts         # Instance list + delete (admin only)
    customers.ts         # Customer search + detail
    pickups.ts           # Pickup event creation
    admin-pickup-events.ts  # Pickup history queries
```

## Database Schema (V2)

Tables: `customers`, `route_templates`, `template_stops`, `route_instances`, `instance_stops`, `v2_pickup_events`

```
route_templates ──→ template_stops ──→ customers
       │
       ↓ (Send to Driver)
route_instances ──→ instance_stops ──→ customers
                          │
                          ↓
                   v2_pickup_events
```

Key relationships:
- `template_stops.template_id` → `route_templates.id`
- `template_stops.customer_id` → `customers.stripe_customer_id`
- `route_instances.template_id` → `route_templates.id`
- `instance_stops.instance_id` → `route_instances.id`
- `instance_stops.customer_id` → `customers.stripe_customer_id`
- `v2_pickup_events.instance_stop_id` → `instance_stops.id`

### V1 Tables (archived, do not use)

The following tables are from V1 and should not be referenced in code:
`routes`, `stops`, `pickup_events`, `message_state`

## Core Workflow

1. **Admin creates a route template** with customer stops
2. **Admin taps "Send"** → creates a `route_instance` + `instance_stops` for today
3. **Driver opens app** → sees active instances via direct Supabase query + Realtime
4. **Driver taps route** → sees all stops, enters initials, logs pickups
5. **Pickup events** are appended to `v2_pickup_events` (never updated, append-only)

## Data Flow

```
ADMIN SIDE (via API routes):
  Admin UI → fetch('/api/admin/...') → Next.js Route Handler → Supabase → Response

DRIVER SIDE (direct):
  Driver UI → supabase.from('table').select() → Supabase → Response
  Driver UI ← supabase.channel().on('postgres_changes') ← Supabase Realtime
```

## Authentication

- **Driver app:** No auth (public). Queries use Supabase anon key.
- **Admin panel:** Password-based with HTTP-only cookie (`admin_auth`)
- **Admin API routes:** Protected by Next.js middleware (`middleware.ts`) — validates cookie on all `/api/admin/*` routes except `/api/admin/auth`

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `ADMIN_PASSWORD` — Admin panel password (no default)

## Conventions

- **Components:** React functional components with hooks. No class components.
- **Styling:** Tailwind utility classes. Use `cn()` from `lib/utils.ts` for conditional classes.
- **Driver data fetching:** Direct Supabase queries in components. Supabase Realtime for live updates.
- **Admin data fetching:** Client-side via `useEffect` + data functions in `lib/data/`.
- **Error handling:** All data functions return `{ data, error }` pattern. UI shows error states with retry.
- **Types:** Define in `lib/types.ts`. Avoid `any` — use proper types or `unknown`.
- **API routes:** Only for admin operations. Driver reads go direct to Supabase.
- **Offline:** Pickup events queue to localStorage when offline, sync when online via OfflineIndicator.
- **Timezone:** Use `getTodayEastern()` from utils for date comparisons (server runs UTC).

## Design System

- Brand colors defined in `tailwind.config.ts` (`fxbg-green`, `fxbg-brown`, etc.)
- iOS-style typography scale (Large Title through Caption)
- Mobile-first, touch-optimized with `active:scale-[0.98]` press feedback
- Shadcn components in `components/ui/` — extend, don't modify originals

## Git Workflow

- **Always push to `main`** — do not create or use feature branches unless explicitly asked.
- Commit and push directly to `main` for all changes.
