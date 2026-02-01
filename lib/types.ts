// Database table types (matching live Supabase schema)
export interface Customer {
  stripe_customer_id: string  // PRIMARY KEY
  name: string
  phone?: string
  address?: string
  subscription_type?: string
  status?: string
  notes?: Record<string, any>  // jsonb
}

export interface Route {
  id: number  // PRIMARY KEY (auto-increment)
  date?: string
  driver?: string
  notes?: Record<string, any>  // jsonb
}

export interface Stop {
  id: number  // PRIMARY KEY (auto-increment)
  customer_id: string  // FK -> customers.stripe_customer_id
  route_id: number  // FK -> routes.id
  stop_type?: string
  visible_to_driver?: boolean
  stop_order: number
  flags?: string  // text (not array)
  flag_notes?: string
  customer_flags?: string
}

export interface PickupEvent {
  id: number  // PRIMARY KEY (auto-increment)
  stop_id: number  // FK -> stops.id
  driver_initials: string
  notes?: string  // text (not jsonb)
  completed: boolean
  timestamp: string  // timestamptz
  permanent?: boolean
}

export interface MessageState {
  id: number
  customer_id: string
  message_type: string
  sent_at?: string
  status: string
  metadata?: Record<string, any>
}

// Combined types for UI display
export interface StopWithCustomer extends Stop {
  customer: Customer
}

export interface RouteWithStops extends Route {
  stops: StopWithCustomer[]
}

// Validation types
export interface PickupEventPayload {
  stop_id: number
  driver_initials: string
  completed: boolean
  notes?: string
}

// Admin types - Route with stop count for list view
export interface RouteWithStopCount extends Route {
  stop_count: number
}

// Admin types - Stop with latest pickup status for driver view
export interface StopWithStatus extends StopWithCustomer {
  latest_pickup?: PickupEvent
}

// Admin payloads - Create route
export interface CreateRoutePayload {
  date?: string
  driver?: string
  notes?: Record<string, any>
}

// Admin payloads - Update route
export interface UpdateRoutePayload {
  date?: string
  driver?: string
  notes?: Record<string, any>
}

// Admin payloads - Create stop
export interface CreateStopPayload {
  route_id: number
  customer_id: string  // stripe_customer_id
  stop_order: number
  stop_type?: string
  visible_to_driver?: boolean
  flags?: string
  flag_notes?: string
}

// Admin payloads - Update stop
export interface UpdateStopPayload {
  stop_order?: number
  stop_type?: string
  visible_to_driver?: boolean
  flags?: string
  flag_notes?: string
}

// Admin payloads - Batch update stop orders
export interface BatchStopOrderUpdate {
  stop_id: number
  stop_order: number
}

// Admin types - Pickup event with full context for dashboard
export interface PickupEventWithDetails extends PickupEvent {
  stop: {
    id: number
    stop_order: number
    stop_type?: string
    customer: Customer
    route: Route
  }
}
