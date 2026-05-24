'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { calculateWpm, calculateAccuracy } from '@/lib/typing-engine'

export interface TypingResult {
  wpm: number
  accuracy: number
  duration: number
  errors: number
  charErrors: Record<string, number>
}

interface TypingAreaProps {
  text: string
  onComplete: (result: TypingResult) => void
  /** Fired every 500ms during active typing; use for live HUD updates. */
  onProgress?: (wpm: number, accuracy: number, errors: number, elapsed: number, typedLen: number) => void
  /** Fired on every keystroke with the next expected character; used to drive KeyboardHint. */
  onCurrentChar?: (char: string) => void
  /** Typing text size in px. Defaults to 28. */
  fontSize?: number
}

export function TypingArea({ text, onComplete, onProgress, onCurrentChar, fontSize = 28 }: TypingAreaProps) {
  const [typed, setTyped] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [focused, setFocused] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [atEnd, setAtEnd] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const pRef = useRef<HTMLParagraphElement>(null)
  const charErrorsRef = useRef<Record<string, number>>({})
  const totalKeystrokesRef = useRef(0)
  const correctKeystrokesRef = useRef(0)

  const lineHeight = fontSize * 1.6
  const visibleLines = fontSize >= 56 ? 3 : 4
  const visibleHeight = visibleLines * lineHeight
  const cursorRowFromTop = 1

  const reset = useCallback(() => {
    setTyped([])
    setStartTime(null)
    setErrors(0)
    setCompleted(false)
    setScrollOffset(0)
    setAtEnd(false)
    charErrorsRef.current = {}
    totalKeystrokesRef.current = 0
    correctKeystrokesRef.current = 0
  }, [])

  useEffect(() => { reset() }, [text, reset])

  useEffect(() => {
    if (!startTime || completed) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const correctChars = typed.filter((c, i) => c === text[i]).length
      const wpm = calculateWpm(correctChars, elapsed)
      const acc = calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current)
      onProgress?.(wpm, acc, errors, Math.floor(elapsed), typed.length)
    }, 500)
    return () => clearInterval(interval)
  }, [startTime, typed, text, completed, onProgress, errors])

  useEffect(() => {
    onCurrentChar?.(text[typed.length] ?? '')
  }, [typed.length, text, onCurrentChar])

  // Line clipping via cursor offsetTop measurement
  useLayoutEffect(() => {
    if (!cursorRef.current || !pRef.current) {
      setScrollOffset(0)
      setAtEnd(false)
      return
    }
    const cursorTop = cursorRef.current.offsetTop
    const totalHeight = pRef.current.scrollHeight
    let target = cursorTop - cursorRowFromTop * lineHeight
    const maxScroll = Math.max(0, totalHeight - visibleHeight)
    target = Math.max(0, Math.min(target, maxScroll))
    setScrollOffset(target)
    setAtEnd(target >= maxScroll - 0.5)
  }, [fontSize, lineHeight, visibleHeight, typed.length, text])

  const fadeMask = !atEnd
    ? `linear-gradient(180deg, #000 0%, #000 ${100 - Math.round(100 / visibleLines)}%, transparent 100%)`
    : undefined

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (completed) return
      if (e.ctrlKey || e.altKey || e.metaKey) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        setTyped((prev) => prev.slice(0, -1))
        return
      }

      if (e.key.length !== 1) return
      e.preventDefault()

      if (!startTime) setStartTime(Date.now())

      const idx = typed.length
      if (idx >= text.length) return

      const expectedChar = text[idx]
      const typedChar = e.key

      totalKeystrokesRef.current++

      // errors counts total wrong keystrokes and is never decremented on backspace —
      // it represents raw mistakes made, not the current number of incorrect characters.
      if (typedChar !== expectedChar) {
        setErrors((prev) => prev + 1)
        const k = expectedChar.toLowerCase()
        charErrorsRef.current[k] = (charErrorsRef.current[k] ?? 0) + 1
      } else {
        correctKeystrokesRef.current++
      }

      const newTyped = [...typed, typedChar]
      setTyped(newTyped)

      if (newTyped.length === text.length) {
        setCompleted(true)
        const elapsed = startTime ? (Date.now() - startTime) / 1000 : 1
        const correctChars = newTyped.filter((c, i) => c === text[i]).length
        const finalWpm = calculateWpm(correctChars, elapsed)
        const finalErrors = errors + (typedChar !== expectedChar ? 1 : 0)
        const finalAccuracy = calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current)
        onComplete({
          wpm: finalWpm,
          accuracy: finalAccuracy,
          duration: Math.round(elapsed),
          errors: finalErrors,
          charErrors: charErrorsRef.current,
        })
      }
    },
    [completed, startTime, typed, text, errors, onComplete]
  )

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        position: 'relative',
        width: '100%',
        cursor: 'text',
        outline: 'none',
      }}
      aria-label="Typing area"
    >
      {!focused && !completed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          background: 'rgba(255,246,227,0.65)',
          backdropFilter: 'blur(1px)',
          borderRadius: 12,
        }}>
          <p style={{ color: 'var(--color-ink-muted)', fontSize: 14, fontFamily: 'Nunito, sans-serif' }}>
            Click to start typing
          </p>
        </div>
      )}

      <div style={{
        width: '100%',
        height: visibleHeight,
        overflow: 'hidden',
        WebkitMaskImage: fadeMask,
        maskImage: fadeMask,
      }}>
        <p ref={pRef} style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize,
          lineHeight: 1.6,
          letterSpacing: '0.02em',
          transform: `translateY(-${scrollOffset}px)`,
          transition: 'transform 200ms',
          margin: 0,
          userSelect: 'none',
          wordBreak: 'break-word',
        }}>
          {text.split('').map((ch, i) => {
            const isTyped = i < typed.length
            const isCurrent = i === typed.length
            const isCorrect = isTyped && typed[i] === ch
            const isError = isTyped && typed[i] !== ch

            if (isCurrent) {
              return (
                <span key={i} ref={cursorRef} style={{
                  color: '#1a1a2e',
                  background: 'rgba(78,168,222,0.35)',
                  borderRadius: 3,
                  position: 'relative',
                }}>
                  {ch}
                  <span aria-hidden="true" style={{
                    position: 'absolute',
                    left: '5%', right: '5%', bottom: '-0.12em',
                    height: '0.12em',
                    background: '#1a1a2e',
                    borderRadius: 2,
                    animation: 'blink 1s step-end infinite',
                  }} />
                </span>
              )
            }

            if (isError) {
              return (
                <span key={i} style={{
                  color: 'var(--color-coral)',
                  background: 'rgba(255,94,91,0.18)',
                  borderRadius: 3,
                }}>
                  {ch}
                </span>
              )
            }

            if (isCorrect) {
              return (
                <span key={i} style={{ color: '#1a1a2e' }}>
                  {ch}
                </span>
              )
            }

            // Untyped
            return (
              <span key={i} style={{ color: 'rgba(26,26,46,0.30)' }}>
                {ch}
              </span>
            )
          })}
        </p>
      </div>
    </div>
  )
}
