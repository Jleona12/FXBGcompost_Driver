# Backend Contract - DO NOT BREAK

This document defines the stable backend boundary that MUST NOT change during UI refactors.

## Database Schema (Supabase Postgres)
**Single Source of Truth**

### Routes Table
- `id` (int, PRIMARY KEY)
- `date` (date)
- `driver` (varchar)
- `notes` (jsonb)

### Stops Table
- `id` (int, PRIMARY KEY)
- `route_id` (int, FK -> routes.id)
- `customer_id` (varchar, FK -> customers.stripe_customer_id)
- `stop_type` (varchar)
- `visible_to_driver` (bool)
- `stop_order` (int)
- `flags` (text)
- `flag_notes` (text)
- `customer_flags` (text)

### Customers Table
- `stripe_customer_id` (varchar, PRIMARY KEY)
- `name` (varchar)
- `phone` (varchar)
- `address` (varchar)
- `subscription_type` (varchar)
- `status` (varchar)
- `notes` (jsonb)

### Pickup Events Table (APPEND-ONLY)
- `id` (int, PRIMARY KEY)
- `stop_id` (int, FK -> stops.id)
- `driver_initials` (varchar)
- `timestamp` (timestamptz)
- `notes` (text)
- `completed` (bool)
- `permanent` (bool)

## API Endpoints (STABLE)

### GET /api/routes/[routeId]
**Request:**
- URL param: `routeId` (string, parsed as int)

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "route_id": 1,
    "customer_id": "cus_xxx",
    "stop_order": 1,
    "stop_type": "pickup",
    "visible_to_driver": true,
    "flags": "...",
    "customer": {
      "stripe_customer_id": "cus_xxx",
      "name": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St",
      ...
    }
  }
]
```

### POST /api/pickups
**Request:**
```json
{
  "stop_id": 1,
  "driver_initials": "JD",
  "completed": true,
  "notes": "Left at door"
}
```

**Response:** 201 Created
```json
{
  "id": 123,
  "stop_id": 1,
  "driver_initials": "JD",
  "timestamp": "2024-01-15T10:30:00Z",
  "completed": true,
  "notes": "Left at door",
  "permanent": false
}
```

## Offline Queue (CRITICAL)

**localStorage keys:**
- `fxbg_pickup_queue` - Array of pending PickupEventPayload objects
- `fxbg_last_sync` - Timestamp of last successful sync

**Functions in lib/utils.ts:**
- `queuePickupEvent(payload)` - Add to queue
- `getQueuedEvents()` - Retrieve queue
- `clearQueuedEvents()` - Clear after sync
- `isOnline()` - Check network status

**Behavior:**
- When offline, pickup submissions queue to localStorage
- When online again, OfflineIndicator auto-syncs queue
- Synced events POST to `/api/pickups` one by one
- Queue cleared only after all succeed

## Type Definitions (STABLE)
**lib/types.ts** - Matches DB schema exactly. DO NOT MODIFY.

## Data Access Layer (NEW - USE THIS)
**lib/data/** - All data operations MUST go through these modules:
- `routes.ts`: `fetchRoutes()`
- `stops.ts`: `fetchStopsByRoute(routeId)`
- `pickups.ts`: `createPickupEvent(payload)`

## What UI Can Change
- Component structure
- Styling (Tailwind classes, shadcn/ui)
- Layout and navigation patterns
- Visual design
- User interactions

## What UI Cannot Change
- Data fetching logic (except to use lib/data layer)
- API request/response shapes
- Offline queue behavior
- Type definitions
- Database queries
