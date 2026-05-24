'use client'

import { useEffect, useState } from 'react'

export type TypingFontSize = 'sm' | 'md' | 'lg'

const KEY = 'kq-typing-font-size'

/** Reads and persists the user's preferred typing text size via localStorage. */
export function useTypingFontSize() {
  const [fontSize, setFontSizeState] = useState<TypingFontSize>('md')

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as TypingFontSize | null
    if (stored === 'sm' || stored === 'md' || stored === 'lg') {
      setFontSizeState(stored)
    }
  }, [])

  const setFontSize = (size: TypingFontSize) => {
    localStorage.setItem(KEY, size)
    setFontSizeState(size)
  }

  return { fontSize, setFontSize }
}
