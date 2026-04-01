import {
  RouteTemplateWithStopCount,
  RouteTemplateWithStops,
  TemplateStopWithCustomer,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  BatchStopOrderUpdate,
} from '@/lib/types'

// --- Template CRUD ---

export async function fetchTemplates(): Promise<{
  data: RouteTemplateWithStopCount[] | null
  error: Error | null
}> {
  try {
    const response = await fetch('/api/admin/templates')
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}

export async function fetchTemplateForEdit(
  templateId: number
): Promise<{ data: RouteTemplateWithStops | null; error: Error | null }> {
  try {
    const response = await fetch(`/api/admin/templates/${templateId}`)
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}

export async function createTemplate(
  payload: CreateTemplatePayload
): Promise<{ data: RouteTemplateWithStopCount | null; error: Error | null }> {
  try {
    const response = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}

export async function updateTemplate(
  templateId: number,
  payload: UpdateTemplatePayload
): Promise<{ data: any; error: Error | null }> {
  try {
    const response = await fetch(`/api/admin/templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}

export async function deleteTemplate(
  templateId: number
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const response = await fetch(`/api/admin/templates/${templateId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { success: false, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Network error') }
  }
}

// --- Template Stop Management ---

export async function addTemplateStop(
  templateId: number,
  payload: { customer_id: string; stop_order: number; stop_type?: string; driver_notes?: string }
): Promise<{ data: TemplateStopWithCustomer | null; error: Error | null }> {
  try {
    const response = await fetch(`/api/admin/templates/${templateId}/stops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}

export async function deleteTemplateStop(
  templateId: number,
  stopId: number
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const response = await fetch(`/api/admin/templates/${templateId}/stops?stopId=${stopId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { success: false, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Network error') }
  }
}

export async function batchUpdateTemplateStopOrders(
  templateId: number,
  updates: BatchStopOrderUpdate[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const response = await fetch(`/api/admin/templates/${templateId}/stops/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { success: false, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Network error') }
  }
}

// --- Activate Template ---

export async function activateTemplate(
  templateId: number,
  payload: { date: string; stops: any[]; notes?: any }
): Promise<{ data: any; error: Error | null }> {
  try {
    const response = await fetch(`/api/admin/templates/${templateId}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}
