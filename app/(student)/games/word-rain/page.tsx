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
        <Link href="/games" className="text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-100">🌧️ Word Rain</h1>
          <p className="text-slate-400 text-sm">Type the falling words before they hit the ground!</p>
        </div>
        {personalBest !== null && (
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5" />
            <span className="font-bold">{personalBest} pts</span>
          </div>
        )}
      </div>

      {lastScore !== null && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 px-4 py-2 text-sm flex items-center gap-2">
          <span className="text-slate-400">Last score:</span>
          <span className="font-bold text-emerald-400">{lastScore} pts</span>
          {personalBest === lastScore && <span className="text-amber-400 text-xs">🏆 New best!</span>}
        </div>
      )}

      <WordRain onComplete={handleComplete} />
    </div>
  )
}
