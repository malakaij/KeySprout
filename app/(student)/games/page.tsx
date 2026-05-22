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
        <h1 className="text-2xl font-display text-ink">Typing Games</h1>
        <p className="text-ink/50 mt-1 font-body">Have fun while improving your typing speed and accuracy!</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="kq-card overflow-hidden">
          <div className="bg-gradient-to-br from-sky/30 to-paper-dark p-6 border-b-[3px] border-ink/10">
            <div className="text-4xl mb-3">🌧️</div>
            <h2 className="text-xl font-display text-ink">Word Rain</h2>
            <p className="text-sm text-ink/50 mt-2 font-body">
              Words fall from the sky. Type them before they reach the bottom!
              Get 3 lives and compete for the highest score.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sunny" />
              <span className="text-sm text-ink/70 font-body">
                Personal Best: <span className="font-display text-mint">{wordRainBest} pts</span>
              </span>
            </div>
            <Link
              href="/games/word-rain"
              className="kq-btn bg-sky text-white block w-full text-center px-4 py-3"
            >
              Play Word Rain
            </Link>
          </div>
        </div>

        <div className="kq-card overflow-hidden">
          <div className="bg-gradient-to-br from-sunny/30 to-paper-dark p-6 border-b-[3px] border-ink/10">
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-xl font-display text-ink">Letter Hunt</h2>
            <p className="text-sm text-ink/50 mt-2 font-body">
              Press the highlighted key as fast as you can! Build combos and beat your
              reaction time in this 60-second challenge.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-sunny" />
              <span className="text-sm text-ink/70 font-body">
                Personal Best: <span className="font-display text-mint">{letterHuntBest} pts</span>
              </span>
            </div>
            <Link
              href="/games/letter-hunt"
              className="kq-btn bg-sunny text-ink block w-full text-center px-4 py-3"
            >
              Play Letter Hunt
            </Link>
          </div>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="kq-card p-5">
          <h2 className="font-display text-ink mb-4">Recent Scores</h2>
          <div className="space-y-2">
            {scores.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-ink/70 font-body">
                  {s.gameType === 'WORD_RAIN' ? '🌧️ Word Rain' : '🎯 Letter Hunt'}
                </span>
                <span className="font-display text-mint">{s.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
