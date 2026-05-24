'use client'

import { useEffect, useState } from 'react'

export type TypingFontSize = 18 | 28 | 40 | 56

const KEY = 'kq-typing-font-size'
const VALID: TypingFontSize[] = [18, 28, 40, 56]

/** Reads and persists the user's preferred typing text size via localStorage. */
export function useTypingFontSize() {
  const [fontSize, setFontSizeState] = useState<TypingFontSize>(28)

  useEffect(() => {
    const n = parseInt(localStorage.getItem(KEY) ?? '', 10) as TypingFontSize
    if (VALID.includes(n)) setFontSizeState(n)
  }, [])

  const setFontSize = (size: TypingFontSize) => {
    localStorage.setItem(KEY, String(size))
    setFontSizeState(size)
  }

  return { fontSize, setFontSize }
}
