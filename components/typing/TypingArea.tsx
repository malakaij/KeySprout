'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { calculateWpm, calculateAccuracy } from '@/lib/typing-engine'
import { StatsBar } from './StatsBar'
import { cn } from '@/lib/utils'

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
  onProgress?: (wpm: number, accuracy: number) => void
}

export function TypingArea({ text, onComplete, onProgress }: TypingAreaProps) {
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

  useEffect(() => {
    reset()
  }, [text, reset])

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
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [typed.length])

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

      if (!startTime) {
        setStartTime(Date.now())
      }

      const idx = typed.length
      if (idx >= text.length) return

      const expectedChar = text[idx]
      const typedChar = e.key

      totalKeystrokesRef.current++

      if (typedChar !== expectedChar) {
        setErrors((prev) => prev + 1)
        const key = expectedChar.toLowerCase()
        charErrorsRef.current[key] = (charErrorsRef.current[key] ?? 0) + 1
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
    <div className="space-y-4">
      <StatsBar wpm={liveWpm} accuracy={liveAccuracy} timeElapsed={timeElapsed} errors={errors} />

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'relative bg-slate-800 rounded-xl p-6 outline-none border-2 transition-colors cursor-text',
          'max-h-48 overflow-y-auto',
          focused ? 'border-emerald-500' : 'border-slate-700'
        )}
        aria-label="Typing area"
      >
        {!focused && !completed && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-xl z-10">
            <p className="text-slate-400 text-sm">Click to start typing</p>
          </div>
        )}

        <p className="font-mono text-lg leading-relaxed select-none break-words">
          {text.split('').map((char, i) => {
            const isTyped = i < typed.length
            const isCurrent = i === typed.length
            const isCorrect = isTyped && typed[i] === char
            const isError = isTyped && typed[i] !== char

            return (
              <span
                key={i}
                ref={isCurrent ? cursorRef : null}
                className={cn(
                  'relative',
                  !isTyped && 'text-slate-400',
                  isCorrect && 'text-emerald-400',
                  isError && 'text-red-400',
                  isCurrent && 'text-white after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-white after:animate-blink'
                )}
              >
                {char}
              </span>
            )
          })}
        </p>
      </div>

      {completed && (
        <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 text-center">
          <p className="text-emerald-400 font-semibold">Lesson Complete!</p>
          <p className="text-slate-300 text-sm mt-1">
            {liveWpm} WPM · {Math.round(liveAccuracy * 100)}% accuracy
          </p>
        </div>
      )}
    </div>
  )
}
