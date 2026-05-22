'use client'

import { useState } from 'react'
import { WordRain } from '@/components/games/WordRain'
import { Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function WordRainPage() {
  const [personalBest, setPersonalBest] = useState<number | null>(null)
  const [lastScore, setLastScore] = useState<number | null>(null)

  const handleComplete = async (score: number) => {
    setLastScore(score)
    if (personalBest === null || score > personalBest) {
      setPersonalBest(score)
    }
    try {
      await fetch('/api/games/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType: 'WORD_RAIN', score }),
      })
    } catch {
      // Score save failed silently
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/games" className="text-ink/40 hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display text-ink">🌧️ Word Rain</h1>
          <p className="text-ink/50 text-sm font-body">Type the falling words before they hit the ground!</p>
        </div>
        {personalBest !== null && (
          <div className="flex items-center gap-2 text-sunny">
            <Trophy className="w-5 h-5" />
            <span className="font-display text-ink">{personalBest} pts</span>
          </div>
        )}
      </div>

      {lastScore !== null && (
        <div className="kq-card px-4 py-2 text-sm flex items-center gap-2">
          <span className="text-ink/50 font-body">Last score:</span>
          <span className="font-display text-mint">{lastScore} pts</span>
          {personalBest === lastScore && <span className="text-sunny text-xs font-body">🏆 New best!</span>}
        </div>
      )}

      <WordRain onComplete={handleComplete} />
    </div>
  )
}
