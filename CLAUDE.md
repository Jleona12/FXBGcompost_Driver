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

```
route_templates ──→ template_stops ──→ customers
       │                                   ↑
       ↓ (Send to Driver)                  │
route_instances ──→ instance_stops ────────┘
                          │
                          ↓
                   v2_pickup_events

subscriptions ──→ customers (Stripe billing, not used by app yet)
```

### Table: `customers`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `stripe_customer_id` | varchar | **PK** | — | Primary key, from Stripe |
| `name` | varchar | NO | — | Customer display name |
| `phone` | varchar | YES | — | Phone number |
| `address` | varchar | YES | — | Pickup address |
| `subscription_type` | varchar | YES | — | e.g. "weekly", "biweekly" |
| `status` | varchar | YES | `'active'` | active / paused / cancelled |
| `notes` | jsonb | YES | `'{}'` | Admin notes |

### Table: `route_templates`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | serial | **PK** | auto | |
| `name` | text | NO | — | Route name (e.g. "Thursday Route") |
| `notes` | jsonb | YES | — | Admin notes |
| `is_active` | boolean | NO | `true` | false = retired/archived |
| `created_at` | timestamptz | NO | `now()` | |

### Table: `template_stops`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | serial | **PK** | auto | |
| `template_id` | int | NO | — | **FK → route_templates.id** |
| `customer_id` | text | NO | — | **FK → customers.stripe_customer_id** |
| `stop_order` | int | NO | — | Sequential: 1, 2, 3… |
| `stop_type` | text | YES | `'pickup'` | pickup / delivery / both |
| `driver_notes` | text | YES | — | Instructions for driver |
| `created_at` | timestamptz | NO | `now()` | |

### Table: `route_instances`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | serial | **PK** | auto | |
| `template_id` | int | NO | — | **FK → route_templates.id** |
| `date` | date | NO | — | The day this route is for |
| `status` | text | NO | `'active'` | active / archived |
| `notes` | jsonb | YES | — | |
| `created_at` | timestamptz | NO | `now()` | |

### Table: `instance_stops`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | serial | **PK** | auto | |
| `instance_id` | int | NO | — | **FK → route_instances.id** |
| `template_stop_id` | int | YES | — | **FK → template_stops.id** (nullable for ad-hoc stops) |
| `customer_id` | text | NO | — | **FK → customers.stripe_customer_id** |
| `stop_order` | int | NO | — | Sequential: 1, 2, 3… |
| `stop_type` | text | YES | `'pickup'` | pickup / delivery / both |
| `driver_notes` | text | YES | — | Instructions for driver |
| `created_at` | timestamptz | NO | `now()` | |

### Table: `v2_pickup_events`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | serial | **PK** | auto | |
| `instance_stop_id` | int | NO | — | **FK → instance_stops.id** |
| `driver_initials` | text | NO | — | 2-3 chars, uppercase |
| `completed` | boolean | NO | — | Was pickup completed? |
| `notes` | text | YES | — | Driver feedback |
| `timestamp` | timestamptz | NO | `now()` | When logged |

### Table: `subscriptions` (Stripe billing — not used by driver app)

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `stripe_subscription_id` | text | **PK** | — | From Stripe |
| `stripe_customer_id` | text | NO | — | **FK → customers.stripe_customer_id** |
| `status` | text | YES | — | Stripe subscription status |
| `product_name` | text | YES | — | |
| `price_id` | text | YES | — | |
| `current_period_end` | timestamptz | YES | — | |
| `cancel_at_period_end` | boolean | YES | — | |
| `raw` | jsonb | YES | `'{}'` | Full Stripe payload |
| `updated_at` | timestamptz | YES | `now()` | |

### Naming Conventions

- **Tables:** snake_case, plural nouns (`route_templates`, `instance_stops`)
- **Columns:** snake_case (`stop_order`, `driver_notes`, `created_at`)
- **Primary keys:** `id` (serial) for app tables, Stripe IDs for Stripe-synced tables
- **Foreign keys:** `{referenced_table_singular}_id` (e.g. `template_id`, `instance_id`, `customer_id`)
- **Timestamps:** `created_at` for creation, `updated_at` for mutation, `timestamp` for event time
- **Booleans:** descriptive (`is_active`, `completed`, `cancel_at_period_end`)
- **Status fields:** text with known values, not enums (easier to extend)
- **JSON fields:** `notes` (jsonb) for flexible metadata, `raw` for external payloads

### V1 Tables (deleted)

These tables were dropped and should never be recreated:
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
