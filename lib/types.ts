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
