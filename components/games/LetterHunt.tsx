'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { VirtualKeyboard } from '@/components/typing/VirtualKeyboard'

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')

type GameState = 'idle' | 'countdown' | 'playing' | 'gameover'

interface LetterHuntProps {
  onComplete: (score: number) => void
}

export function LetterHunt({ onComplete }: LetterHuntProps) {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [targetKey, setTargetKey] = useState('f')
  const [pressedKey, setPressedKey] = useState<string | undefined>()
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [countdown, setCountdown] = useState(3)
  const [combo, setCombo] = useState(0)
  const [lastReactionMs, setLastReactionMs] = useState<number | null>(null)
  const [keyPressTime, setKeyPressTime] = useState<number>(Date.now())
  const [keyFrequency, setKeyFrequency] = useState<Record<string, number>>({})

  const containerRef = useRef<HTMLDivElement>(null)

  const getNextKey = useCallback((freq: Record<string, number>): string => {
    const weights = LETTERS.map((l) => ({ letter: l, weight: 1 / ((freq[l] ?? 0) + 1) }))
    const total = weights.reduce((s, w) => s + w.weight, 0)
    let rand = Math.random() * total
    for (const w of weights) {
      rand -= w.weight
      if (rand <= 0) return w.letter
    }
    return LETTERS[Math.floor(Math.random() * LETTERS.length)]
  }, [])

  useEffect(() => {
    if (gameState === 'gameover') onComplete(score)
  }, [gameState, score, onComplete])

  useEffect(() => {
    if (gameState !== 'playing') return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { setGameState('gameover'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [gameState])

  useEffect(() => {
    if (gameState !== 'countdown') return
    if (countdown <= 0) {
      setGameState('playing')
      setKeyPressTime(Date.now())
      containerRef.current?.focus()
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [gameState, countdown])

  const startGame = () => {
    setScore(0)
    setTimeLeft(60)
    setCountdown(3)
    setCombo(0)
    setLastReactionMs(null)
    setKeyFrequency({})
    setTargetKey(LETTERS[Math.floor(Math.random() * LETTERS.length)])
    setGameState('countdown')
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState !== 'playing') return
      const key = e.key.toLowerCase()
      if (!LETTERS.includes(key)) return
      e.preventDefault()

      setPressedKey(key)
      setTimeout(() => setPressedKey(undefined), 150)

      const reactionMs = Date.now() - keyPressTime

      if (key === targetKey) {
        setLastReactionMs(reactionMs)
        setCombo((c) => c + 1)
        setScore((s) => Math.max(0, s + Math.max(1, combo + 1)))
        setKeyFrequency((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }))
        setKeyFrequency((freq) => {
          const next = getNextKey(freq)
          setTargetKey(next)
          setKeyPressTime(Date.now())
          return freq
        })
      } else {
        setCombo(0)
        setScore((s) => Math.max(0, s - 1))
      }
    },
    [gameState, targetKey, keyPressTime, combo, getNextKey]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="kq-card px-4 py-2 text-center min-w-[80px]">
          <p className="text-xs text-ink/40 font-body">Score</p>
          <p className="text-2xl font-display text-mint">{score}</p>
        </div>
        <div className="kq-card px-4 py-2 text-center min-w-[80px]">
          <p className="text-xs text-ink/40 font-body">Time</p>
          <p className={cn('text-2xl font-display', timeLeft <= 10 ? 'text-coral' : 'text-ink')}>
            {timeLeft}s
          </p>
        </div>
        <div className="kq-card px-4 py-2 text-center min-w-[80px]">
          <p className="text-xs text-ink/40 font-body">Combo</p>
          <p className={cn('text-2xl font-display', combo > 5 ? 'text-sunny' : 'text-ink')}>
            x{combo}
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-2xl kq-card p-6 focus:outline-none focus:shadow-ink-lg"
      >
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <h2 className="text-2xl font-display text-ink">Letter Hunt</h2>
            <p className="text-ink/50 text-center max-w-xs font-body text-sm">
              Press the highlighted key as fast as you can! Score points for each correct press.
            </p>
            <button onClick={startGame} className="kq-btn bg-sunny text-ink px-6 py-3">
              Start Game
            </button>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-ink/50 font-body">Get ready...</p>
            <p className="text-7xl font-display text-coral">{countdown || 'GO!'}</p>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <h2 className="text-2xl font-display text-ink">Time&apos;s Up!</h2>
            <p className="text-4xl font-display text-mint">{score} pts</p>
            {lastReactionMs && (
              <p className="text-ink/40 text-sm font-body">Last reaction: {lastReactionMs}ms</p>
            )}
            <button onClick={startGame} className="kq-btn bg-sunny text-ink px-6 py-3">
              Play Again
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm text-ink/50 mb-3 font-body">Press this key:</p>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sunny border-[3px] border-ink text-ink text-4xl font-display shadow-ink animate-pulse-ring">
                {targetKey}
              </div>
              {lastReactionMs && (
                <p className="text-xs text-ink/30 mt-2 font-body">{lastReactionMs}ms</p>
              )}
            </div>
            <VirtualKeyboard highlightKey={targetKey} pressedKey={pressedKey} />
          </div>
        )}
      </div>

      {gameState === 'playing' && (
        <p className="text-ink/30 text-sm font-body">Press keys on your physical keyboard</p>
      )}
    </div>
  )
}
