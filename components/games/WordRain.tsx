'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'

const WORDS = [
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
  'was', 'one', 'our', 'day', 'get', 'has', 'him', 'how', 'let', 'put',
  'say', 'she', 'too', 'use', 'run', 'big', 'now', 'old', 'see', 'two',
  'way', 'who', 'did', 'its', 'sit', 'set', 'fun', 'win', 'top', 'red',
  'hot', 'sun', 'cat', 'dog', 'map', 'cup', 'box', 'key', 'sky', 'sea',
  'fire', 'work', 'play', 'time', 'life', 'hand', 'head', 'long', 'said',
  'each', 'tell', 'does', 'side', 'move', 'help', 'home', 'came', 'part',
  'find', 'look', 'turn', 'open', 'seem', 'want', 'give', 'most', 'keep',
  'make', 'name', 'take', 'same', 'need', 'show', 'feel', 'know', 'live',
  'read', 'back', 'call', 'last', 'left', 'next', 'over', 'such', 'upon',
  'good', 'very', 'also', 'into', 'down', 'that', 'this', 'from', 'your',
  'they', 'than', 'more', 'when', 'some', 'what', 'come', 'here', 'just',
  'like', 'long', 'much', 'only', 'real', 'well', 'will', 'with', 'then',
  'them', 'even', 'both', 'ever', 'high', 'away', 'body', 'city', 'draw',
  'grow', 'hold', 'jump', 'kind', 'mind', 'near', 'once', 'pick', 'pull',
  'push', 'rain', 'road', 'rock', 'room', 'ship', 'sing', 'slow', 'soft',
  'stay', 'stop', 'talk', 'tree', 'true', 'town', 'walk', 'warm', 'week',
  'wide', 'wild', 'wind', 'wish', 'wood', 'word', 'year', 'able', 'best',
  'blue', 'boat', 'born', 'care', 'case', 'cool', 'cost', 'dark', 'dead',
]

interface FallingWord {
  id: number
  word: string
  /** Horizontal spawn position as a percentage of the game area width. */
  x: number
  /** Time in milliseconds for the word to traverse the full 400px game area height. */
  duration: number
  /** Date.now() at spawn; vertical position is computed at render time as (elapsed/duration)*400. */
  startTime: number
}

type GameState = 'idle' | 'playing' | 'paused' | 'gameover'

interface WordRainProps {
  onComplete: (score: number) => void
}

export function WordRain({ onComplete }: WordRainProps) {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [words, setWords] = useState<FallingWord[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(90)
  const [flashId, setFlashId] = useState<number | null>(null)

  const nextId = useRef(0)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const spawnInterval = Math.max(800, 2500 - level * 200)
  const fallDuration = Math.max(3000, 8000 - level * 500)

  const spawnWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)]
    const x = Math.random() * 80 + 5
    const id = nextId.current++
    setWords((prev) => [...prev, { id, word, x, duration: fallDuration, startTime: Date.now() }])
  }, [fallDuration])

  useEffect(() => {
    if (gameState !== 'playing') return
    const interval = setInterval(spawnWord, spawnInterval)
    return () => clearInterval(interval)
  }, [gameState, spawnWord, spawnInterval])

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
    if (gameState !== 'playing') return
    const interval = setInterval(() => {
      const now = Date.now()
      setWords((prev) => {
        const expired = prev.filter((w) => now - w.startTime >= w.duration)
        if (expired.length > 0) {
          setLives((l) => {
            const newLives = l - expired.length
            if (newLives <= 0) { setGameState('gameover'); return 0 }
            return newLives
          })
          return prev.filter((w) => now - w.startTime < w.duration)
        }
        return prev
      })
    }, 500)
    return () => clearInterval(interval)
  }, [gameState])

  useEffect(() => {
    if (Math.floor(score / 5) + 1 !== level) {
      setLevel(Math.min(10, Math.floor(score / 5) + 1))
    }
  }, [score, level])

  useEffect(() => {
    if (gameState === 'gameover') onComplete(score)
  }, [gameState, score, onComplete])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const typed = currentInput.trim().toLowerCase()
      if (!typed) return
      const now = Date.now()
      // Among duplicate words on screen, destroy the one closest to the bottom
      // (highest elapsed time) so the most dangerous word is removed first.
      const matchIdx = words.reduce<number>((best, w, i) => {
        if (w.word === typed) {
          if (best === -1) return i
          return now - w.startTime > now - words[best].startTime ? i : best
        }
        return best
      }, -1)
      if (matchIdx !== -1) {
        const matched = words[matchIdx]
        setFlashId(matched.id)
        setTimeout(() => setFlashId(null), 300)
        setWords((prev) => prev.filter((_, i) => i !== matchIdx))
        setScore((s) => s + 1)
      }
      setCurrentInput('')
    }
  }

  const startGame = () => {
    setWords([])
    setScore(0)
    setLives(3)
    setLevel(1)
    setTimeLeft(90)
    setCurrentInput('')
    setGameState('playing')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className={cn('w-5 h-5', i < lives ? 'text-coral fill-coral' : 'text-ink/20')}
            />
          ))}
        </div>
        <div className="text-center">
          <span className="text-2xl font-display text-mint">{score}</span>
          <span className="text-ink/40 text-sm ml-2 font-body">pts</span>
        </div>
        <div className="text-right">
          <span className={cn('font-mono font-bold', timeLeft <= 10 ? 'text-coral' : 'text-ink')}>
            {timeLeft}s
          </span>
          <span className="text-ink/40 text-sm ml-2 font-body">Lv.{level}</span>
        </div>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        className="relative w-full max-w-2xl bg-ink rounded-2xl border-[3px] border-ink overflow-hidden"
        style={{ height: '400px' }}
      >
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-display text-paper">Word Rain</h2>
            <p className="text-paper/60 text-center max-w-xs font-body text-sm">
              Words fall from the sky. Type the word and press Space or Enter to destroy it!
            </p>
            <button onClick={startGame} className="kq-btn bg-mint text-ink px-6 py-3">
              Start Game
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/95">
            <h2 className="text-2xl font-display text-paper">Game Over!</h2>
            <p className="text-4xl font-display text-mint">{score} pts</p>
            <button onClick={startGame} className="kq-btn bg-mint text-ink px-6 py-3">
              Play Again
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'paused') &&
          words.map((w) => {
            const elapsed = Date.now() - w.startTime
            const progress = elapsed / w.duration
            const top = progress * 400 - 30
            return (
              <div
                key={w.id}
                className={cn(
                  'absolute px-3 py-1 rounded-lg text-sm font-mono font-bold transition-all border-2',
                  flashId === w.id
                    ? 'bg-mint border-mint text-ink scale-125 opacity-0'
                    : 'bg-paper border-ink/30 text-ink'
                )}
                style={{ left: `${w.x}%`, top: `${Math.max(0, top)}px`, transform: 'translateX(-50%)' }}
              >
                {w.word}
              </div>
            )
          })}
      </div>

      {(gameState === 'playing' || gameState === 'paused') && (
        <input
          ref={inputRef}
          value={currentInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type the falling word..."
          className="w-full max-w-2xl bg-paper border-[3px] border-ink rounded-2xl px-4 py-3 text-ink font-mono text-lg placeholder-ink/30 focus:outline-hidden shadow-ink-sm"
        />
      )}
    </div>
  )
}
