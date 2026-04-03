import { InstanceForDriver } from '@/lib/types'
import { adminGet, adminAction } from './admin-fetch'

export const fetchAdminInstances = (status?: string) => {
  const path = status
    ? `/api/admin/instances?status=${status}`
    : '/api/admin/instances'
  return adminGet<InstanceForDriver[]>(path)
}

export const deleteInstance = (instanceId: number) =>
  adminAction(`/api/admin/instances/${instanceId}`, 'DELETE')
