# FXBG Compost Driver

Mobile-first PWA for managing compost pickup routes in Fredericksburg, VA.

## Quick Reference

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build (also validates TypeScript)
npm run lint     # ESLint check
npm run start    # Start production server
```

## Architecture

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Database:** Supabase (PostgreSQL via PostgREST)
- **UI:** Tailwind CSS + Shadcn/UI (Radix primitives) + Lucide icons
- **PWA:** next-pwa with offline queue support
- **Deployment:** Vercel (assumed)

## Project Structure

```
app/
  (driver)/              # Driver-facing route group (public, no auth)
    page.tsx             # Route list dashboard
    route/[routeId]/     # Pickup execution flow
  admin/                 # Admin dashboard (password-protected)
    customers/           # Customer management
    routes/              # Route CRUD + stop ordering
    pickups/             # Pickup event history
  api/
    routes/              # Driver API (public)
    pickups/             # Pickup event creation (public)
    admin/               # Admin CRUD API (auth required via middleware)
components/
  ui/                    # Shadcn primitives (don't edit directly)
  admin/                 # Admin-specific components
lib/
  supabase.ts            # Supabase client (singleton)
  types.ts               # All TypeScript interfaces (mirrors DB schema)
  utils.ts               # Helpers: validation, formatting, offline queue
  data/                  # Data access functions (fetch/create/update)
```

## Database Schema

Tables: `customers`, `routes`, `stops`, `pickup_events`, `message_state`

Key relationships:
- `stops.customer_id` → `customers.stripe_customer_id`
- `stops.route_id` → `routes.id`
- `pickup_events.stop_id` → `stops.id`

Types in `lib/types.ts` mirror the live Supabase schema exactly.

## Authentication

- **Driver app:** No auth (public)
- **Admin panel:** Password-based with HTTP-only cookie
- **Admin API routes:** Protected by Next.js middleware (`middleware.ts`) — validates `admin_auth` cookie on all `/api/admin/*` routes except `/api/admin/auth`

## Environment Variables

See `.env.example` for all required variables. The app will fail fast if required vars are missing.

Required:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `ADMIN_PASSWORD` — Admin panel password (no default)

## Conventions

- **Components:** React functional components with hooks. No class components.
- **Styling:** Tailwind utility classes. Use `cn()` from `lib/utils.ts` for conditional classes.
- **Data fetching:** Client-side via `useEffect` + data functions in `lib/data/`. No Server Components for data fetching.
- **Error handling:** All data functions return `{ data, error }` pattern. UI shows error states with retry.
- **Types:** Define in `lib/types.ts`. Avoid `any` — use proper types or `unknown`.
- **API routes:** Use Next.js Route Handlers. Admin routes are protected by middleware.
- **Offline:** Pickup events queue to localStorage when offline, sync when online.

## Design System

- Brand colors defined in `tailwind.config.ts` (`fxbg-green`, `fxbg-brown`, etc.)
- iOS-style typography scale (Large Title through Caption)
- Mobile-first, touch-optimized with `active:scale-[0.98]` press feedback
- Shadcn components in `components/ui/` — extend, don't modify originals
