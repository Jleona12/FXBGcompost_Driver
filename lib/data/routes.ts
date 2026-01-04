import { supabase } from '@/lib/supabase'
import { Route } from '@/lib/types'

/**
 * Fetches all routes ordered by most recent first
 * @returns Array of routes or empty array on error
 */
export async function fetchRoutes(): Promise<{ data: Route[] | null; error: Error | null }> {
  try {
    const { data, error: fetchError } = await supabase
      .from('routes')
      .select('id,date,driver,notes')
      .order('id', { ascending: false })

    if (fetchError) {
      console.error('[data/routes] Supabase fetchRoutes error:', fetchError)
      return { data: null, error: new Error(fetchError.message) }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('[data/routes] Unexpected fetchRoutes error:', err)
    return { data: null, error: err instanceof Error ? err : new Error('Unknown error') }
  }
}
