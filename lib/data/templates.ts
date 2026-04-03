import {
  RouteTemplateWithStopCount,
  RouteTemplateWithStops,
  TemplateStopWithCustomer,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  BatchStopOrderUpdate,
  RouteTemplate,
  RouteInstance,
} from '@/lib/types'
import { adminGet, adminMutate, adminAction } from './admin-fetch'

// --- Template CRUD ---

export const fetchTemplates = () =>
  adminGet<RouteTemplateWithStopCount[]>('/api/admin/templates')

export const fetchTemplateForEdit = (templateId: number) =>
  adminGet<RouteTemplateWithStops>(`/api/admin/templates/${templateId}`)

export const createTemplate = (payload: CreateTemplatePayload) =>
  adminMutate<RouteTemplateWithStopCount>('/api/admin/templates', 'POST', payload)

export const updateTemplate = (templateId: number, payload: UpdateTemplatePayload) =>
  adminMutate<RouteTemplate>(`/api/admin/templates/${templateId}`, 'PUT', payload)

export const deleteTemplate = (templateId: number) =>
  adminAction(`/api/admin/templates/${templateId}`, 'DELETE')

// --- Template Stop Management ---

export const addTemplateStop = (
  templateId: number,
  payload: { customer_id: string; stop_order: number; stop_type?: string; driver_notes?: string }
) =>
  adminMutate<TemplateStopWithCustomer>(`/api/admin/templates/${templateId}/stops`, 'POST', payload)

export const deleteTemplateStop = (templateId: number, stopId: number) =>
  adminAction(`/api/admin/templates/${templateId}/stops?stopId=${stopId}`, 'DELETE')

export const batchUpdateTemplateStopOrders = (templateId: number, updates: BatchStopOrderUpdate[]) =>
  adminAction(`/api/admin/templates/${templateId}/stops/batch`, 'POST', { updates })

// --- One-tap Send to Driver ---

export const sendToDriver = (templateId: number, date?: string) =>
  adminMutate<RouteInstance>(`/api/admin/templates/${templateId}/send`, 'POST', { date })

// --- Copy Route ---

export const copyTemplate = (templateId: number) =>
  adminMutate<RouteTemplateWithStopCount>(`/api/admin/templates/${templateId}/copy`, 'POST')
