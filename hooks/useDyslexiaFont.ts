'use client'

import { useEffect, useState } from 'react'

export type DyslexiaFont = 'default' | 'opendyslexic' | 'atkinson' | 'lexend' | 'andika'

export const FONT_OPTIONS: { value: DyslexiaFont; label: string; stack: string }[] = [
  { value: 'default',      label: 'Default (Nunito)',       stack: 'Nunito, sans-serif' },
  { value: 'opendyslexic', label: 'OpenDyslexic',           stack: 'OpenDyslexic, sans-serif' },
  { value: 'atkinson',     label: 'Atkinson Hyperlegible',  stack: 'Atkinson Hyperlegible, sans-serif' },
  { value: 'lexend',       label: 'Lexend',                 stack: 'Lexend, sans-serif' },
  { value: 'andika',       label: 'Andika',                 stack: 'Andika, sans-serif' },
]

const COOKIE = 'kq-font'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function applyFont(font: DyslexiaFont) {
  if (font === 'default') {
    document.documentElement.removeAttribute('data-font')
  } else {
    document.documentElement.setAttribute('data-font', font)
  }
}

/** Writes the font preference to a non-HttpOnly cookie so SSR layouts can apply it without a flash. */
function persistCookie(font: DyslexiaFont) {
  const value = font === 'default' ? '' : font
  const expiry = font === 'default' ? 'expires=Thu, 01 Jan 1970 00:00:00 GMT' : `max-age=${COOKIE_MAX_AGE}`
  document.cookie = `${COOKIE}=${value}; ${expiry}; path=/; SameSite=Lax`
}

/**
 * Reads and persists the user's dyslexia-friendly font preference.
 *
 * Source of truth: server (DB via /api/user/preferences).
 * The cookie is a rendering hint only — it lets the SSR layout apply data-font
 * before hydration so there is no flash on subsequent page loads.
 */
export function useDyslexiaFont() {
  // Seed from whatever SSR already applied to <html> (set by the layout from the cookie).
  const [font, setFontState] = useState<DyslexiaFont>(() => {
    if (typeof document === 'undefined') return 'default'
    return (document.documentElement.getAttribute('data-font') as DyslexiaFont) ?? 'default'
  })

  useEffect(() => {
    // Reconcile with the authoritative server value.
    fetch('/api/user/preferences')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { fontPreference?: string } | null) => {
        if (!data) return
        const serverFont = (data.fontPreference ?? 'default') as DyslexiaFont
        setFontState(serverFont)
        applyFont(serverFont)
        persistCookie(serverFont)
      })
      .catch(() => {
        // Not signed in or network error — keep whatever SSR applied.
      })
  }, [])

  /** Updates the preference in the DB, applies it immediately, and refreshes the SSR cookie. */
  const setFont = async (value: DyslexiaFont) => {
    setFontState(value)
    applyFont(value)
    persistCookie(value)

    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fontPreference: value }),
    })
  }

  return { font, setFont }
}
