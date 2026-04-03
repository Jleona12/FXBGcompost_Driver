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

// --- V2: Templates ---

export interface RouteTemplate {
  id: number
  name: string
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
  notes?: Record<string, any>
}

export interface UpdateTemplatePayload {
  name?: string
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
}
