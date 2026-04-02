'use client'

import { useEffect } from 'react'

// One-time cache clear: wipes stale service worker caches so the app
// always fetches fresh data from the server. Runs on first load after deploy.
const CACHE_VERSION = 'v3-no-sw'

export default function CacheBuster() {
  useEffect(() => {
    const key = `fxbg_cache_version`
    const current = localStorage.getItem(key)

    if (current === CACHE_VERSION) return

    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name))
      })
    }

    // Unregister service workers so they re-install fresh
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((r) => r.unregister())
      })
    }

    localStorage.setItem(key, CACHE_VERSION)

    // Reload once to get fresh content without the old SW intercepting
    if (current !== null) {
      window.location.reload()
    }
  }, [])

  return null
}
