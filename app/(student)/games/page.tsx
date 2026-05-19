import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Trophy } from 'lucide-react'

export default async function GamesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const scores = await prisma.gameScore.findMany({
    where: { userId: session.user.id },
    orderBy: { completedAt: 'desc' },
  })

  const wordRainBest = scores
    .filter((s) => s.gameType === 'WORD_RAIN')
    .reduce((max, s) => Math.max(max, s.score), 0)

  const letterHuntBest = scores
    .filter((s) => s.gameType === 'LETTER_HUNT')
    .reduce((max, s) => Math.max(max, s.score), 0)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Typing Games</h1>
        <p className="text-slate-400 mt-1">Have fun while improving your typing speed and accuracy!</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-900/60 to-slate-800 p-6">
            <div className="text-4xl mb-3">🌧️</div>
            <h2 className="text-xl font-bold text-slate-100">Word Rain</h2>
            <p className="text-sm text-slate-400 mt-2">
              Words fall from the sky. Type them before they reach the bottom!
              Get 3 lives and compete for the highest score.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">
                Personal Best: <span className="font-bold text-amber-400">{wordRainBest} pts</span>
              </span>
            </div>
            <Link
              href="/games/word-rain"
              className="block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
            >
              Play Word Rain
            </Link>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-900/60 to-slate-800 p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-xl font-bold text-slate-100">Letter Hunt</h2>
            <p className="text-sm text-slate-400 mt-2">
              Press the highlighted key as fast as you can! Build combos and beat your
              reaction time in this 60-second challenge.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">
                Personal Best: <span className="font-bold text-amber-400">{letterHuntBest} pts</span>
              </span>
            </div>
            <Link
              href="/games/letter-hunt"
              className="block w-full text-center px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors"
            >
              Play Letter Hunt
            </Link>
          </div>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h2 className="font-semibold text-slate-200 mb-4">Recent Scores</h2>
          <div className="space-y-2">
            {scores.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">
                  {s.gameType === 'WORD_RAIN' ? '🌧️ Word Rain' : '🎯 Letter Hunt'}
                </span>
                <span className="font-bold text-amber-400">{s.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
