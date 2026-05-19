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
    const weights = LETTERS.map((l) => {
      const f = freq[l] ?? 0
      return { letter: l, weight: 1 / (f + 1) }
    })
    const total = weights.reduce((s, w) => s + w.weight, 0)
    let rand = Math.random() * total
    for (const w of weights) {
      rand -= w.weight
      if (rand <= 0) return w.letter
    }
    return LETTERS[Math.floor(Math.random() * LETTERS.length)]
  }, [])

  useEffect(() => {
    if (gameState === 'gameover') {
      onComplete(score)
    }
  }, [gameState, score, onComplete])

  useEffect(() => {
    if (gameState !== 'playing') return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('gameover')
          return 0
        }
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
    const firstKey = LETTERS[Math.floor(Math.random() * LETTERS.length)]
    setTargetKey(firstKey)
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
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-center">
          <p className="text-xs text-slate-400">Score</p>
          <p className="text-3xl font-bold text-emerald-400">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Time</p>
          <p className={cn('text-3xl font-bold font-mono', timeLeft <= 10 ? 'text-red-400' : 'text-amber-400')}>
            {timeLeft}s
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Combo</p>
          <p className={cn('text-3xl font-bold', combo > 5 ? 'text-amber-400' : 'text-slate-300')}>
            x{combo}
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        tabIndex={-1}
        className="w-full max-w-2xl bg-slate-800 rounded-xl border border-slate-700 p-6 focus:outline-none"
      >
        {gameState === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <h2 className="text-2xl font-bold text-slate-100">Letter Hunt</h2>
            <p className="text-slate-400 text-center max-w-xs">
              Press the highlighted key as fast as you can! Score points for each correct press.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-slate-400">Get ready...</p>
            <p className="text-7xl font-bold text-emerald-400">{countdown || 'GO!'}</p>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <h2 className="text-2xl font-bold text-slate-100">Time's Up!</h2>
            <p className="text-4xl font-bold text-emerald-400">{score} pts</p>
            {lastReactionMs && (
              <p className="text-slate-400 text-sm">Last reaction: {lastReactionMs}ms</p>
            )}
            <button
              onClick={startGame}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm text-slate-400 mb-1">Press this key:</p>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 text-3xl font-bold font-mono">
                {targetKey}
              </div>
              {lastReactionMs && (
                <p className="text-xs text-slate-500 mt-2">{lastReactionMs}ms</p>
              )}
            </div>
            <VirtualKeyboard highlightKey={targetKey} pressedKey={pressedKey} />
          </div>
        )}
      </div>

      {gameState === 'playing' && (
        <p className="text-slate-500 text-sm">Press keys on your physical keyboard</p>
      )}
    </div>
  )
}
