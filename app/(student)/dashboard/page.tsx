import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { JoinClassCard } from '@/components/dashboard/JoinClassCard'
import { BookOpen, Zap, Target, Flame, ArrowRight, Gamepad2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { differenceInDays } from 'date-fns'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const userId = session.user.id

  const [attempts, lessons] = await Promise.all([
    prisma.lessonAttempt.findMany({
      where: { userId },
      include: { lesson: { select: { title: true, minWpm: true, minAccuracy: true } } },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.lesson.findMany({ orderBy: { order: 'asc' } }),
  ])

  const avgWpm = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + a.wpm, 0) / attempts.length)
    : 0
  const avgAccuracy = attempts.length > 0
    ? attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length
    : 0

  const passedLessonIdsArr = attempts
    .filter((a) => {
      const wpmOk = !a.lesson.minWpm || a.wpm >= a.lesson.minWpm
      const accOk = !a.lesson.minAccuracy || a.accuracy >= a.lesson.minAccuracy
      return wpmOk && accOk
    })
    .map((a) => a.lessonId)
  const passedLessonIds = new Set(passedLessonIdsArr)

  const streak = (() => {
    if (attempts.length === 0) return 0
    const datesSet = new Set(attempts.map((a) => a.completedAt.toDateString()))
    const dates = Array.from(datesSet).sort().reverse()
    let count = 0
    let current = new Date()
    for (const d of dates) {
      const diff = differenceInDays(current, new Date(d))
      if (diff <= 1) {
        count++
        current = new Date(d)
      } else {
        break
      }
    }
    return count
  })()

  const nextLessons = lessons
    .filter((l) => !passedLessonIds.has(l.id))
    .slice(0, 3)

  const recentAttempts = attempts.slice(0, 5)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Welcome back, {session.user.name?.split(' ')[0] ?? 'Learner'}! 👋
        </h1>
        <p className="text-slate-400 mt-1">Keep up the great work on your typing journey.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Lessons Completed"
          value={passedLessonIds.size}
          icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
        />
        <StatsCard
          label="Average WPM"
          value={avgWpm}
          icon={<Zap className="w-5 h-5 text-amber-400" />}
        />
        <StatsCard
          label="Average Accuracy"
          value={`${Math.round(avgAccuracy * 100)}%`}
          icon={<Target className="w-5 h-5 text-blue-400" />}
        />
        <StatsCard
          label="Day Streak"
          value={streak}
          icon={<Flame className="w-5 h-5 text-orange-400" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-200">Continue Learning</h2>
            <Link href="/lessons" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              All lessons <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {nextLessons.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">
                🎉 You&apos;ve completed all lessons!
              </p>
            ) : (
              nextLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">{lesson.title}</p>
                    <p className="text-xs text-slate-400">{lesson.unit}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h2 className="font-semibold text-slate-200 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentAttempts.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">
                No attempts yet. Start your first lesson!
              </p>
            ) : (
              recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-200 truncate">{attempt.lesson.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(attempt.completedAt)}</p>
                  </div>
                  <div className="flex gap-3 ml-3 flex-shrink-0">
                    <span className="text-emerald-400 font-medium">{Math.round(attempt.wpm)} WPM</span>
                    <span className="text-blue-400">{Math.round(attempt.accuracy * 100)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <JoinClassCard />

      {/* Games */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-200">Practice Games</h2>
          <Gamepad2 className="w-5 h-5 text-amber-400" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/games/word-rain"
            className="p-4 bg-gradient-to-br from-blue-900/40 to-slate-700/40 rounded-xl border border-slate-600 hover:border-blue-600 transition-colors"
          >
            <div className="text-2xl mb-2">🌧️</div>
            <h3 className="font-semibold text-slate-200">Word Rain</h3>
            <p className="text-xs text-slate-400 mt-1">Type falling words before they hit the ground</p>
          </Link>
          <Link
            href="/games/letter-hunt"
            className="p-4 bg-gradient-to-br from-amber-900/40 to-slate-700/40 rounded-xl border border-slate-600 hover:border-amber-600 transition-colors"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-slate-200">Letter Hunt</h3>
            <p className="text-xs text-slate-400 mt-1">Press the highlighted key as fast as you can</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
