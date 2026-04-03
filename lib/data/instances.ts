import { InstanceForDriver } from '@/lib/types'
import { adminGet, adminMutate } from './admin-fetch'

export const fetchAdminInstances = async (status?: string) => {
  // Archive past instances before fetching active ones (was previously a GET side effect)
  if (status === 'active') {
    await adminMutate('/api/admin/instances', 'POST', { action: 'archive-past' })
  }

  const path = status
    ? `/api/admin/instances?status=${status}`
    : '/api/admin/instances'
  return adminGet<InstanceForDriver[]>(path)
}

export const deleteInstance = (instanceId: number) =>
  adminMutate(`/api/admin/instances/${instanceId}`, 'DELETE')
