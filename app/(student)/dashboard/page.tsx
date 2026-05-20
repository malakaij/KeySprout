import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { JoinClassCard } from '@/components/dashboard/JoinClassCard'
import { NameCard } from '@/components/dashboard/NameCard'
import { Pip } from '@/components/ui/Pip'
import { BookOpen, Zap, Target, Flame, ArrowRight, Gamepad2, CheckCircle, Lock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { differenceInDays } from 'date-fns'

const DAILY_LIMIT = 3

function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function getWeekDots(attempts: { completedAt: Date }[]): boolean[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  const dots: boolean[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    const dateStr = d.toDateString()
    dots.push(attempts.some((a) => a.completedAt.toDateString() === dateStr))
  }
  return dots
}

const SECTION_ACCENT_COLORS = [
  { bg: 'bg-mint', border: 'border-mint', text: 'text-ink' },
  { bg: 'bg-sky', border: 'border-sky', text: 'text-white' },
  { bg: 'bg-sunny', border: 'border-sunny', text: 'text-ink' },
  { bg: 'bg-grape', border: 'border-grape', text: 'text-white' },
  { bg: 'bg-coral', border: 'border-coral', text: 'text-white' },
  { bg: 'bg-berry', border: 'border-berry', text: 'text-ink' },
]

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const userId = session.user.id

  const [attempts, lessons, userData, approvedMembership] = await Promise.all([
    prisma.lessonAttempt.findMany({
      where: { userId },
      include: { lesson: { select: { title: true, minWpm: true, minAccuracy: true, section: { select: { title: true } } } } },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.lesson.findMany({
      where: { section: { course: { isPublic: true } } },
      include: { section: { select: { id: true, title: true, order: true } } },
      orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, rerollsToday: true, lastRerollDate: true, nameChangeRequested: true },
    }),
    prisma.classMember.findFirst({ where: { userId, status: 'APPROVED' } }),
  ])

  const usedToday =
    userData?.lastRerollDate && isToday(userData.lastRerollDate)
      ? userData.rerollsToday
      : 0
  const rerollsRemaining = Math.max(0, DAILY_LIMIT - usedToday)
  const isInClass = !!approvedMembership

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

  const attemptedLessonIds = new Set(attempts.map((a) => a.lessonId))

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

  const weekDots = getWeekDots(attempts)

  const nextLessons = lessons
    .filter((l) => !passedLessonIds.has(l.id))
    .slice(0, 3)

  const recentAttempts = attempts.slice(0, 5)

  // Group lessons by section for quest map
  const sectionMap = new Map<string, { id: string; title: string; order: number; lessons: typeof lessons }>()
  for (const lesson of lessons) {
    const sec = lesson.section
    if (!sectionMap.has(sec.id)) {
      sectionMap.set(sec.id, { id: sec.id, title: sec.title, order: sec.order, lessons: [] })
    }
    sectionMap.get(sec.id)!.lessons.push(lesson)
  }
  const sections = Array.from(sectionMap.values()).sort((a, b) => a.order - b.order)

  // Find the first non-passed lesson index (for "current")
  const firstUnpassedId = lessons.find((l) => !passedLessonIds.has(l.id))?.id

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header with Pip */}
      <div className="flex items-center gap-4">
        <Pip size="md" variant="wave" className="flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-display text-ink">
            Welcome back, {session.user.name?.split(' ')[0] ?? 'Learner'}!
          </h1>
          <p className="text-ink/60 mt-1 font-body">Keep up the great work on your typing journey.</p>
        </div>
      </div>

      {/* Streak Tracker */}
      <div className="kq-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-ink">Weekly Streak</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="font-display text-2xl text-coral">{streak}</span>
            <span className="text-ink/50 text-sm font-body">day{streak !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {weekDots.map((active, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-full h-8 rounded-full border-[3px] border-ink transition-all ${
                  active ? 'bg-coral shadow-ink-sm' : 'bg-paper-dark'
                }`}
              />
              <span className="text-xs text-ink/50 font-body">{DAY_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <NameCard
        currentName={userData?.name ?? 'Unknown'}
        rerollsRemaining={rerollsRemaining}
        nameChangeRequested={userData?.nameChangeRequested ?? false}
        isInClass={isInClass}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Lessons Completed"
          value={passedLessonIds.size}
          icon={<BookOpen className="w-5 h-5 text-mint" />}
        />
        <StatsCard
          label="Average WPM"
          value={avgWpm}
          icon={<Zap className="w-5 h-5 text-sunny" />}
        />
        <StatsCard
          label="Average Accuracy"
          value={`${Math.round(avgAccuracy * 100)}%`}
          icon={<Target className="w-5 h-5 text-sky" />}
        />
        <StatsCard
          label="Day Streak"
          value={streak}
          icon={<Flame className="w-5 h-5 text-coral" />}
        />
      </div>

      {/* Quest Map */}
      <div className="kq-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-ink">Quest Map</h2>
          <Link href="/lessons" className="kq-btn bg-sky text-white text-sm px-4 py-1.5 flex items-center gap-1">
            All Lessons <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-6">
          {sections.map((section, si) => {
            const accent = SECTION_ACCENT_COLORS[si % SECTION_ACCENT_COLORS.length]
            return (
              <div key={section.id}>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-[3px] border-ink mb-3 ${accent.bg}`}>
                  <span className={`font-display text-sm ${accent.text}`}>{section.title}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {section.lessons.map((lesson, li) => {
                    const isPassed = passedLessonIds.has(lesson.id)
                    const isCurrent = lesson.id === firstUnpassedId
                    const isAttempted = attemptedLessonIds.has(lesson.id)
                    const isLocked = !isPassed && !isCurrent && !isAttempted &&
                      li > 0 && !passedLessonIds.has(section.lessons[li - 1]?.id ?? '')

                    return (
                      <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                        <div
                          className={`relative w-12 h-12 rounded-full border-[3px] border-ink flex items-center justify-center transition-all cursor-pointer
                            ${isPassed ? 'bg-mint shadow-ink-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5' :
                              isCurrent ? 'bg-coral shadow-ink-sm animate-pulse-ring' :
                              isLocked ? 'bg-paper-dark opacity-60' :
                              'bg-paper-dark hover:bg-paper-dark shadow-ink-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5'}
                          `}
                          title={lesson.title}
                        >
                          {isPassed ? (
                            <CheckCircle className="w-5 h-5 text-ink" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4 text-ink/30" />
                          ) : (
                            <span className="text-xs font-display text-ink">{li + 1}</span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-5 text-xs text-ink/50 font-body">
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-mint border-2 border-ink inline-block" /> Done</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-coral border-2 border-ink inline-block" /> Current</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-paper-dark border-2 border-ink/30 inline-block" /> Locked</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="kq-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink">Continue Learning</h2>
            <Link href="/lessons" className="text-sm text-sky font-semibold hover:text-sky/80 flex items-center gap-1">
              All lessons <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {nextLessons.length === 0 ? (
              <p className="text-ink/50 text-sm py-4 text-center font-body">
                You&apos;ve completed all lessons! 🎉
              </p>
            ) : (
              nextLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="flex items-center justify-between p-3 bg-paper-dark rounded-xl border-2 border-ink/20 hover:border-ink hover:shadow-ink-sm transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{lesson.title}</p>
                    <p className="text-xs text-ink/50 font-body">{lesson.section.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink/40" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="kq-card p-5">
          <h2 className="font-display text-lg text-ink mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentAttempts.length === 0 ? (
              <p className="text-ink/50 text-sm py-4 text-center font-body">
                No attempts yet. Start your first lesson!
              </p>
            ) : (
              recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink font-semibold truncate">{attempt.lesson.title}</p>
                    <p className="text-xs text-ink/40 font-body">{formatDate(attempt.completedAt)}</p>
                  </div>
                  <div className="flex gap-3 ml-3 flex-shrink-0">
                    <span className="text-mint font-bold">{Math.round(attempt.wpm)} WPM</span>
                    <span className="text-sky font-semibold">{Math.round(attempt.accuracy * 100)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <JoinClassCard />

      {/* Games */}
      <div className="kq-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink">Practice Games</h2>
          <Gamepad2 className="w-5 h-5 text-sunny" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/games/word-rain"
            className="p-4 bg-gradient-to-br from-sky/20 to-paper-dark rounded-xl border-[3px] border-ink hover:shadow-ink-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 group"
          >
            <div className="text-2xl mb-2">🌧️</div>
            <h3 className="font-display text-ink">Word Rain</h3>
            <p className="text-xs text-ink/50 mt-1 font-body">Type falling words before they hit the ground</p>
          </Link>
          <Link
            href="/games/letter-hunt"
            className="p-4 bg-gradient-to-br from-sunny/20 to-paper-dark rounded-xl border-[3px] border-ink hover:shadow-ink-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 group"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-display text-ink">Letter Hunt</h3>
            <p className="text-xs text-ink/50 mt-1 font-body">Press the highlighted key as fast as you can</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
