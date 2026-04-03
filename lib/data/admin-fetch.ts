/**
 * Generic fetch wrapper for admin API routes.
 * Replaces 14 nearly-identical fetch-and-unwrap functions with one.
 */

export interface AdminResult<T> {
  data: T | null
  error: Error | null
}

async function extractError(response: Response): Promise<Error> {
  const body = await response.json().catch(() => ({}))
  return new Error(body.error || `HTTP ${response.status}`)
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error('Network error')
}

/** GET with no-store cache policy. */
export async function adminGet<T>(path: string): Promise<AdminResult<T>> {
  try {
    const response = await fetch(path, { cache: 'no-store' })
    if (!response.ok) return { data: null, error: await extractError(response) }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

/** POST/PUT/DELETE that returns JSON data. */
export async function adminMutate<T>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown
): Promise<AdminResult<T>> {
  try {
    const init: RequestInit = { method }
    if (body !== undefined) {
      init.headers = { 'Content-Type': 'application/json' }
      init.body = JSON.stringify(body)
    }
    const response = await fetch(path, init)
    if (!response.ok) return { data: null, error: await extractError(response) }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: toError(err) }
  }
}

/** DELETE/POST that only needs a success boolean, no response body. */
export async function adminAction(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown
): Promise<{ success: boolean; error: Error | null }> {
  const result = await adminMutate(path, method, body)
  return { success: result.error === null, error: result.error }
}
