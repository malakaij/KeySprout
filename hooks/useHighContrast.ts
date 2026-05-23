'use client'

import { useEffect, useState } from 'react'

const COOKIE = 'kq-contrast'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function applyContrast(on: boolean) {
  if (on) {
    document.documentElement.setAttribute('data-contrast', 'high')
  } else {
    document.documentElement.removeAttribute('data-contrast')
  }
}

function persistCookie(on: boolean) {
  if (on) {
    document.cookie = `${COOKIE}=high; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`
  } else {
    document.cookie = `${COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
  }
}

/**
 * Reads and persists the user's high-contrast preference.
 *
 * Source of truth: server (DB via /api/user/preferences).
 * The cookie lets the SSR layout apply data-contrast before hydration.
 * The prefers-contrast: more media query is handled entirely in CSS.
 */
export function useHighContrast() {
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.getAttribute('data-contrast') === 'high'
  })

  useEffect(() => {
    fetch('/api/user/preferences')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { highContrast?: boolean } | null) => {
        if (!data) return
        const serverVal = data.highContrast ?? false
        setHighContrastState(serverVal)
        applyContrast(serverVal)
        persistCookie(serverVal)
      })
      .catch(() => {})
  }, [])

  /** Toggles high-contrast mode, saving the preference to the DB. */
  const setHighContrast = async (value: boolean) => {
    setHighContrastState(value)
    applyContrast(value)
    persistCookie(value)

    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ highContrast: value }),
    })
  }

  return { highContrast, setHighContrast }
}
