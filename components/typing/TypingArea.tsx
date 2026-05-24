'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { calculateWpm, calculateAccuracy } from '@/lib/typing-engine'
import { StatsBar } from './StatsBar'
import { cn } from '@/lib/utils'
import type { TypingFontSize } from '@/hooks/useTypingFontSize'

interface TypingResult {
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
  onProgress?: (wpm: number, accuracy: number) => void
  /** Fired on every keystroke with the next expected character; used to drive KeyboardHint. */
  onCurrentChar?: (char: string) => void
  /** Typing text size. Defaults to 'md'. */
  fontSize?: TypingFontSize
}

const FONT_CLASS: Record<TypingFontSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

// Approximate characters that fit per visible line at each font size in the
// max-w-3xl (720px content) container. Used for line-clipping window math.
const CHARS_PER_LINE: Record<TypingFontSize, number> = {
  sm: 64,
  md: 56,
  lg: 50,
}

/** Pre-computes the character index where each display line starts, word-wrapping at charsPerLine. */
function computeLineStarts(text: string, charsPerLine: number): number[] {
  const starts = [0]
  let pos = 0
  while (pos < text.length) {
    let next = pos + charsPerLine
    if (next >= text.length) break
    // Walk back to the last space so we don't break mid-word.
    while (next > pos && text[next] !== ' ') next--
    if (next === pos) next = pos + charsPerLine // no space found — hard break
    starts.push(next + 1) // +1 skips the space itself
    pos = next + 1
  }
  return starts
}

export function TypingArea({ text, onComplete, onProgress, onCurrentChar, fontSize = 'md' }: TypingAreaProps) {
  const [typed, setTyped] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [liveWpm, setLiveWpm] = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(1)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [focused, setFocused] = useState(false)
  const [completed, setCompleted] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const charErrorsRef = useRef<Record<string, number>>({})
  const totalKeystrokesRef = useRef(0)
  const correctKeystrokesRef = useRef(0)

  const reset = useCallback(() => {
    setTyped([])
    setStartTime(null)
    setErrors(0)
    setLiveWpm(0)
    setLiveAccuracy(1)
    setTimeElapsed(0)
    setCompleted(false)
    charErrorsRef.current = {}
    totalKeystrokesRef.current = 0
    correctKeystrokesRef.current = 0
  }, [])

  useEffect(() => { reset() }, [text, reset])

  useEffect(() => {
    if (!startTime || completed) return
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      setTimeElapsed(Math.floor(elapsed))
      const correctChars = typed.filter((c, i) => c === text[i]).length
      const wpm = calculateWpm(correctChars, elapsed)
      const acc = calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current)
      setLiveWpm(wpm)
      setLiveAccuracy(acc)
      onProgress?.(wpm, acc)
    }, 500)
    return () => clearInterval(interval)
  }, [startTime, typed, text, completed, onProgress])

  useEffect(() => {
    onCurrentChar?.(text[typed.length] ?? '')
  }, [typed.length, text, onCurrentChar])

  // Line-clipping: compute which slice of text is currently visible.
  const lineStarts = useMemo(() => computeLineStarts(text, CHARS_PER_LINE[fontSize]), [text, fontSize])

  const currentLineIdx = lineStarts.reduce((best, start, i) => (start <= typed.length ? i : best), 0)
  const visibleStart = lineStarts[currentLineIdx] ?? 0
  const visibleEnd = lineStarts[currentLineIdx + 3] ?? text.length

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
        const finalAccuracy = calculateAccuracy(correctKeystrokesRef.current, totalKeystrokesRef.current)
        onComplete({
          wpm: finalWpm,
          accuracy: finalAccuracy,
          duration: Math.round(elapsed),
          errors: errors + (typedChar !== expectedChar ? 1 : 0),
          charErrors: charErrorsRef.current,
        })
      }
    },
    [completed, startTime, typed, text, errors, onComplete]
  )

  return (
    <div className="space-y-2">
      <StatsBar wpm={liveWpm} accuracy={liveAccuracy} timeElapsed={timeElapsed} errors={errors} />

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'relative cursor-text outline-hidden rounded-xl px-4 py-5 transition-colors duration-150',
          focused ? 'bg-paper-dark/60' : 'bg-paper-dark/30 hover:bg-paper-dark/50'
        )}
        aria-label="Typing area"
      >
        {!focused && !completed && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl z-10 bg-paper/40 backdrop-blur-[1px]">
            <p className="text-ink-muted text-sm font-body">Click to start typing</p>
          </div>
        )}

        {/* Three-line clipped view of the text */}
        <p
          className={cn('font-mono leading-relaxed select-none', FONT_CLASS[fontSize])}
          style={{ minHeight: '4.5em' }}
        >
          {text.slice(visibleStart, visibleEnd).split('').map((char, i) => {
            const gi = visibleStart + i // global index in original text
            const isTyped = gi < typed.length
            const isCurrent = gi === typed.length
            const isCorrect = isTyped && typed[gi] === char
            const isError = isTyped && typed[gi] !== char

            return (
              <span
                key={gi}
                ref={isCurrent ? cursorRef : null}
                className={cn(
                  'relative',
                  !isTyped && 'text-ink/40',
                  isCorrect && 'text-ink',
                  isError && 'text-coral bg-coral/10 rounded',
                  isCurrent && 'text-ink after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-ink after:animate-blink'
                )}
              >
                {char}
              </span>
            )
          })}
        </p>

        {/* Fade at bottom to hint at more text */}
        {visibleEnd < text.length && (
          <div className="absolute bottom-0 left-0 right-0 h-8 rounded-b-xl bg-gradient-to-t from-paper-dark/60 to-transparent pointer-events-none" />
        )}
      </div>

      {completed && (
        <div className="kq-card p-4 text-center bg-mint/10 border-mint">
          <p className="text-mint font-display">Lesson Complete!</p>
          <p className="text-ink-muted text-sm mt-1 font-body">
            {liveWpm} WPM · {Math.round(liveAccuracy * 100)}% accuracy
          </p>
        </div>
      )}
    </div>
  )
}
