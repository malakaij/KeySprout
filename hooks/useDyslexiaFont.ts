'use client'

import { useEffect, useState } from 'react'

export type DyslexiaFont = 'default' | 'opendyslexic' | 'atkinson' | 'lexend' | 'andika'

export const FONT_OPTIONS: { value: DyslexiaFont; label: string; stack: string }[] = [
  { value: 'default',      label: 'Default (Nunito)',          stack: 'Nunito, sans-serif' },
  { value: 'opendyslexic', label: 'OpenDyslexic',              stack: 'OpenDyslexic, sans-serif' },
  { value: 'atkinson',     label: 'Atkinson Hyperlegible',     stack: 'Atkinson Hyperlegible, sans-serif' },
  { value: 'lexend',       label: 'Lexend',                    stack: 'Lexend, sans-serif' },
  { value: 'andika',       label: 'Andika',                    stack: 'Andika, sans-serif' },
]

const STORAGE_KEY = 'kq-font'

function applyFont(font: DyslexiaFont) {
  if (font === 'default') {
    document.documentElement.removeAttribute('data-font')
  } else {
    document.documentElement.setAttribute('data-font', font)
  }
}

/** Persists and applies a dyslexia-friendly font preference across the app. */
export function useDyslexiaFont() {
  const [font, setFontState] = useState<DyslexiaFont>('default')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as DyslexiaFont | null
    if (saved && FONT_OPTIONS.some((o) => o.value === saved)) {
      setFontState(saved)
      applyFont(saved)
    }
  }, [])

  const setFont = (value: DyslexiaFont) => {
    setFontState(value)
    applyFont(value)
    if (value === 'default') {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, value)
    }
  }

  return { font, setFont }
}
