// =============================================================
// Database table types — V2 Templates + Instances architecture
// =============================================================

// Shared / unchanged
export interface Customer {
  stripe_customer_id: string  // PRIMARY KEY
  name: string
  phone?: string
  address?: string
  subscription_type?: string
  status?: string
  notes?: Record<string, any>  // jsonb
}

export interface MessageState {
  id: number
  customer_id: string
  message_type: string
  sent_at?: string
  status: string
  metadata?: Record<string, any>
}

// --- V2: Templates ---

export interface RouteTemplate {
  id: number
  name: string
  frequency: string        // 'weekly' | 'biweekly' | 'monthly'
  notes?: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface TemplateStop {
  id: number
  template_id: number
  customer_id: string
  stop_order: number
  stop_type: string
  driver_notes?: string
  created_at: string
}

export interface TemplateStopWithCustomer extends TemplateStop {
  customer: Customer
}

export interface RouteTemplateWithStops extends RouteTemplate {
  stops: TemplateStopWithCustomer[]
}

export interface RouteTemplateWithStopCount extends RouteTemplate {
  stop_count: number
}

// --- V2: Instances ---

export interface RouteInstance {
  id: number
  template_id: number
  date: string
  status: string           // 'active' | 'archived'
  notes?: Record<string, any>
  created_at: string
}

export interface RouteInstanceWithTemplate extends RouteInstance {
  template: RouteTemplate
}

export interface InstanceStop {
  id: number
  instance_id: number
  template_stop_id?: number
  customer_id: string
  stop_order: number
  stop_type: string
  driver_notes?: string
  visible_to_driver: boolean
  created_at: string
}

export interface InstanceStopWithCustomer extends InstanceStop {
  customer: Customer
}

// --- V2: Pickup Events ---

export interface PickupEvent {
  id: number
  instance_stop_id: number
  driver_initials: string
  completed: boolean
  notes?: string
  timestamp: string
}

// Driver view — instance stop with customer + latest pickup
export interface StopWithStatus extends InstanceStopWithCustomer {
  latest_pickup?: PickupEvent
}

// Driver home — instance with template name for display
export interface InstanceForDriver extends RouteInstance {
  template_name: string
  stop_count: number
}

// --- Payloads ---

export interface CreateTemplatePayload {
  name: string
  frequency?: string
  notes?: Record<string, any>
}

export interface UpdateTemplatePayload {
  name?: string
  frequency?: string
  notes?: Record<string, any>
  is_active?: boolean
}

export interface CreateTemplateStopPayload {
  template_id: number
  customer_id: string
  stop_order: number
  stop_type?: string
  driver_notes?: string
}

export interface ActivateTemplatePayload {
  date: string
  // Stops to include (allows removing/reordering at activation time)
  stops: {
    template_stop_id: number
    customer_id: string
    stop_order: number
    stop_type: string
    driver_notes?: string
    visible_to_driver: boolean
  }[]
}

export interface PickupEventPayload {
  instance_stop_id: number
  driver_initials: string
  completed: boolean
  notes?: string
}

export interface BatchStopOrderUpdate {
  stop_id: number
  stop_order: number
}

// --- Admin pickup history ---

export interface PickupEventWithDetails extends PickupEvent {
  instance_stop?: {
    id: number
    stop_order: number
    stop_type: string
    customer: Customer
    instance: RouteInstance
  }
  // Legacy field for backward compat with existing pickups page
  stop?: {
    id: number
    stop_order: number
    stop_type?: string
    customer: Customer
    route: Route
  }
}

// =============================================================
// Legacy types — kept for backward compatibility during migration
// =============================================================

export interface Route {
  id: number
  date?: string
  driver?: string
  notes?: Record<string, any>
}

export interface Stop {
  id: number
  customer_id: string
  route_id: number
  stop_type?: string
  visible_to_driver?: boolean
  stop_order: number
  flags?: string
  flag_notes?: string
  customer_flags?: string
}

export interface StopWithCustomer extends Stop {
  customer: Customer
}

export interface RouteWithStops extends Route {
  stops: StopWithCustomer[]
}

export interface RouteWithStopCount extends Route {
  stop_count: number
}

export interface CreateRoutePayload {
  date?: string
  driver?: string
  notes?: Record<string, any>
}

export interface UpdateRoutePayload {
  date?: string
  driver?: string
  notes?: Record<string, any>
}

export interface CreateStopPayload {
  route_id: number
  customer_id: string
  stop_order: number
  stop_type?: string
  visible_to_driver?: boolean
  flags?: string
  flag_notes?: string
}

export interface UpdateStopPayload {
  stop_order?: number
  stop_type?: string
  visible_to_driver?: boolean
  flags?: string
  flag_notes?: string
}
