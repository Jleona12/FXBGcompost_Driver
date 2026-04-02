# FXBG Compost Driver — V2

Mobile-first web app for managing compost pickup routes in Fredericksburg, VA.

## Features

- **Admin Panel:** Create route templates, add customer stops, one-tap "Send to Driver"
- **Driver Dashboard:** See active routes in real-time, log pickups, reorder stops
- **Realtime Updates:** Driver dashboard updates instantly when admin sends/removes routes
- **Offline Support:** Pickup events queue to localStorage when offline, auto-sync when online
- **Copy Routes:** Duplicate route templates for weekly reuse

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Database:** Supabase (PostgreSQL + Realtime)
- **UI:** Tailwind CSS + Shadcn/UI (Radix primitives) + Lucide icons
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project ([supabase.com](https://supabase.com))

### Installation

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=your-admin-password
```

### Run

```bash
npm run dev        # http://localhost:3000 (driver view)
                   # http://localhost:3000/admin (admin panel)
```

## Architecture

### Two-Sided App

| Side | Auth | Data Access | Purpose |
|------|------|-------------|---------|
| **Driver** (`/`) | Public (no auth) | Direct Supabase queries from browser | View routes, log pickups |
| **Admin** (`/admin`) | Password + cookie | Next.js API routes → Supabase | Manage templates, customers, send routes |

### Why Direct Supabase for Drivers?

The driver app queries Supabase directly from the browser instead of going through API routes. This eliminates every caching layer (Next.js server cache, Vercel CDN, service workers) and ensures the driver always sees live data. Admin operations still use API routes for server-side auth validation.

### Data Flow

```
ADMIN:  Browser → fetch('/api/admin/...') → Next.js API Route → Supabase
DRIVER: Browser → supabase.from('table').select() → Supabase (direct)
DRIVER: Browser ← supabase.channel().on('postgres_changes') ← Supabase Realtime
```

## Database Schema (V2)

```
route_templates ──→ template_stops ──→ customers
       │
       ↓ (Admin taps "Send")
route_instances ──→ instance_stops ──→ customers
                          │
                          ↓ (Driver logs pickup)
                   v2_pickup_events
```

### Active Tables

| Table | Purpose |
|-------|---------|
| `customers` | Customer records (name, address, phone, Stripe ID) |
| `route_templates` | Reusable route definitions |
| `template_stops` | Stops within a template (linked to customers) |
| `route_instances` | A specific day's route sent to driver (status: active/archived) |
| `instance_stops` | Stops within an instance (copied from template on send) |
| `v2_pickup_events` | Append-only pickup log (driver initials, completed, notes) |

### V1 Tables (Archived)

These tables are from V1 and are **not used** by the application:
`routes`, `stops`, `pickup_events`, `message_state`

See "Supabase Cleanup" below for instructions on removing them.

## Core Workflow

1. **Admin creates a route template** with customer stops (drag to reorder)
2. **Admin taps "Send"** → creates a `route_instance` + `instance_stops` for today
3. **Driver opens app** → sees active routes via direct Supabase query + Realtime
4. **Driver taps route** → enters initials → sees stops with customer info
5. **Driver logs pickups** → appended to `v2_pickup_events` (never updated)
6. **Admin taps "Copy"** → duplicates template for next week's reuse

## Project Structure

```
app/
  (driver)/              # Driver-facing (public, no auth)
    page.tsx             # Dashboard — queries Supabase directly
    route/[routeId]/     # Route execution — queries Supabase directly
  admin/                 # Admin panel (password-protected)
    customers/           # Customer management
    templates/           # Route template CRUD + stop ordering
    pickups/             # Pickup event history
  api/
    v2-pickups/          # POST pickup events (driver + offline sync)
    instance-stops/      # PATCH driver notes
    admin/               # All admin CRUD (auth required via middleware)
components/
  ui/                    # Shadcn primitives
  admin/                 # SortableStopCard, SortableStopList
  RouteList.tsx          # Driver dashboard — Supabase direct + Realtime
  StopList.tsx           # Driver stop list with drag-reorder
  StopDetail.tsx         # Individual stop with pickup logging
  StopCard.tsx           # Stop card UI
  InitialsPrompt.tsx     # Driver initials entry
  CacheBuster.tsx        # Clears old service worker caches on deploy
  OfflineIndicator.tsx   # Offline status + queued event sync
lib/
  supabase.ts            # Supabase client (browser + server)
  types.ts               # TypeScript interfaces (V2 schema)
  utils.ts               # Validation, formatting, offline queue, timezone
  data/                  # Admin data access (fetch via API routes)
```

## Authentication

- **Driver app:** No auth. Uses Supabase anon key (public).
- **Admin panel:** Password-based login with HTTP-only cookie (`admin_auth`).
- **Admin API:** Protected by Next.js middleware — validates cookie on `/api/admin/*`.

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `ADMIN_PASSWORD` | Yes | Admin panel password |

## Supabase Cleanup

The following V1 tables can be safely dropped — they are not referenced anywhere in the codebase:

```sql
-- Run in Supabase SQL Editor to remove V1 tables
DROP TABLE IF EXISTS pickup_events CASCADE;
DROP TABLE IF EXISTS stops CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS message_state CASCADE;
```

### Supabase Realtime Setup

For instant driver updates, enable Realtime on the `route_instances` table:

1. Go to Supabase Dashboard → Database → Replication
2. Enable the `route_instances` table in the publication
3. (Optional) Also enable `v2_pickup_events` for live pickup status

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### After Deploy

The CacheBuster component automatically clears old service worker caches in users' browsers on first visit after a new deploy.

## V1 Documentation

Historical V1 documentation is archived in `docs/v1-archive/` for reference:
- `SETUP.md` — Original database schema and setup
- `QUICKSTART.md` — Original quick start guide
- `STRUCTURE.md` — Original project structure
- `DEPLOYMENT_CHECKLIST.md` — Original deployment checklist

## License

Proprietary — FXBG Compost
