import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { JoinClassCard } from '@/components/dashboard/JoinClassCard'
import { NameCard } from '@/components/dashboard/NameCard'
import { Pip } from '@/components/ui/Pip'
import { BookOpen, Zap, Target, Flame, ArrowRight, Gamepad2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { differenceInDays } from 'date-fns'

const DAILY_LIMIT = 3

const ACCENT_BG: Record<string, string> = {
  mint: 'bg-mint', sky: 'bg-sky', sunny: 'bg-sunny',
  grape: 'bg-grape', coral: 'bg-coral', berry: 'bg-berry',
}
const ACCENT_TEXT: Record<string, string> = {
  mint: 'text-ink', sky: 'text-ink', sunny: 'text-ink',
  grape: 'text-white', coral: 'text-white', berry: 'text-white',
}

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
  const dayOfWeek = today.getDay()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dayOfWeek + i)
    const dateStr = d.toDateString()
    return attempts.some((a) => a.completedAt.toDateString() === dateStr)
  })
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const userId = session.user.id

  const [attempts, enrollments, userData, approvedMembership] = await Promise.all([
    prisma.lessonAttempt.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            title: true,
            minWpm: true,
            minAccuracy: true,
            section: { select: { title: true } },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.courseEnrollment.findMany({
      where: { userId },
      orderBy: [{ lastLessonAt: { sort: 'desc', nulls: 'last' } }],
      include: {
        course: {
          select: {
            id: true,
            title: true,
            icon: true,
            accent: true,
            sections: {
              orderBy: { order: 'asc' },
              include: { lessons: { orderBy: { order: 'asc' } } },
            },
          },
        },
      },
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

  const passedLessonIds = new Set(
    attempts
      .filter((a) => {
        const wpmOk = !a.lesson.minWpm || a.wpm >= a.lesson.minWpm
        const accOk = !a.lesson.minAccuracy || a.accuracy >= a.lesson.minAccuracy
        return wpmOk && accOk
      })
      .map((a) => a.lessonId)
  )

  const streak = (() => {
    if (attempts.length === 0) return 0
    const datesSet = new Set(attempts.map((a) => a.completedAt.toDateString()))
    const dates = Array.from(datesSet).sort().reverse()
    let count = 0
    let current = new Date()
    for (const d of dates) {
      const diff = differenceInDays(current, new Date(d))
      if (diff <= 1) { count++; current = new Date(d) }
      else break
    }
    return count
  })()

  const weekDots = getWeekDots(attempts)
  const recentAttempts = attempts.slice(0, 5)

  // Find the next lesson from the most recently active enrolled course
  type UpNext = {
    lessonId: string
    lessonTitle: string
    lessonContent: string | null
    sectionTitle: string
    courseTitle: string
    courseAccent: string
    courseIcon: string
  }
  let upNext: UpNext | null = null

  for (const enrollment of enrollments) {
    const course = enrollment.course
    let prevPassed = true
    outer: for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (!prevPassed) break outer
        if (!passedLessonIds.has(lesson.id)) {
          upNext = {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lessonContent: lesson.content,
            sectionTitle: section.title,
            courseTitle: course.title,
            courseAccent: course.accent,
            courseIcon: course.icon,
          }
          break outer
        }
        prevPassed = passedLessonIds.has(lesson.id)
      }
    }
    if (upNext) break
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Pip size="md" variant="wave" className="shrink-0" />
        <div>
          <h1 className="text-2xl font-display text-ink">
            Welcome back, {session.user.name?.split(' ')[0] ?? 'Learner'}!
          </h1>
          <p className="text-ink-muted mt-1 font-body">Keep up the great work on your typing journey.</p>
        </div>
      </div>

      {/* Up Next */}
      {upNext ? (
        <div className="kq-card overflow-hidden">
          <div className={`px-5 py-3 flex items-center gap-2 border-b-[3px] border-ink ${ACCENT_BG[upNext.courseAccent] ?? 'bg-mint'}`}>
            <span aria-hidden="true">{upNext.courseIcon}</span>
            <span className={`text-sm font-display ${ACCENT_TEXT[upNext.courseAccent] ?? 'text-ink'}`}>
              Up Next · {upNext.courseTitle}
            </span>
          </div>
          <div className="p-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-ink-muted font-body mb-1">{upNext.sectionTitle}</p>
              <h2 className="font-display text-lg text-ink leading-snug">{upNext.lessonTitle}</h2>
              {upNext.lessonContent && (
                <p className="text-sm font-body text-ink-muted mt-1.5 italic line-clamp-2">
                  {upNext.lessonContent.slice(0, 120)}{upNext.lessonContent.length > 120 ? '…' : ''}
                </p>
              )}
            </div>
            <Link
              href={`/lessons/${upNext.lessonId}`}
              className={`shrink-0 kq-btn px-5 py-2.5 font-display text-sm flex items-center gap-2 ${ACCENT_BG[upNext.courseAccent] ?? 'bg-mint'} ${ACCENT_TEXT[upNext.courseAccent] ?? 'text-ink'}`}
            >
              Start <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="kq-card p-5 flex items-center justify-between gap-4">
          <p className="font-body text-ink-muted">Pick a course to start your typing journey.</p>
          <Link href="/courses" className="kq-btn bg-mint text-ink px-4 py-2 text-sm font-display shrink-0">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="kq-card p-5 text-center">
          <p className="font-display text-ink text-lg">🎉 All caught up!</p>
          <p className="text-ink-muted font-body text-sm mt-1">You&apos;ve completed every lesson in your courses.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Lessons Passed" value={passedLessonIds.size} icon={<BookOpen className="w-5 h-5 text-mint" />} />
        <StatsCard label="Average WPM" value={avgWpm} icon={<Zap className="w-5 h-5 text-sunny" />} />
        <StatsCard label="Avg Accuracy" value={`${Math.round(avgAccuracy * 100)}%`} icon={<Target className="w-5 h-5 text-sky" />} />
        <StatsCard label="Day Streak" value={streak} icon={<Flame className="w-5 h-5 text-coral" />} />
      </div>

      {/* Weekly Streak */}
      <div className="kq-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-ink">This Week</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">🔥</span>
            <span className="font-display text-2xl text-coral">{streak}</span>
            <span className="text-ink-muted text-sm font-body">day{streak !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {weekDots.map((active, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-full h-8 rounded-full border-[3px] border-ink transition-all ${active ? 'bg-coral shadow-ink-sm' : 'bg-paper-dark'}`} />
              <span className="text-xs text-ink-muted font-body">{DAY_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="kq-card p-5">
          <h2 className="font-display text-lg text-ink mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentAttempts.length === 0 ? (
              <p className="text-ink-muted text-sm py-4 text-center font-body">
                No attempts yet. Start your first lesson!
              </p>
            ) : (
              recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-ink font-semibold truncate">{attempt.lesson.title}</p>
                    <p className="text-xs text-ink-muted font-body">{formatDate(attempt.completedAt)}</p>
                  </div>
                  <div className="flex gap-3 ml-3 shrink-0">
                    <span className="text-mint font-bold">{Math.round(attempt.wpm)} WPM</span>
                    <span className="text-sky font-semibold">{Math.round(attempt.accuracy * 100)}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Practice Games */}
        <div className="kq-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink">Practice Games</h2>
            <Gamepad2 className="w-5 h-5 text-sunny" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            <Link
              href="/games/word-rain"
              className="flex items-center gap-3 p-3 bg-paper-dark rounded-xl border-2 border-ink/20 hover:border-ink hover:shadow-ink-sm transition-all"
            >
              <span className="text-2xl" aria-hidden="true">🌧️</span>
              <div>
                <p className="font-display text-sm text-ink">Word Rain</p>
                <p className="text-xs text-ink-muted font-body">Type falling words before they hit the ground</p>
              </div>
            </Link>
            <Link
              href="/games/letter-hunt"
              className="flex items-center gap-3 p-3 bg-paper-dark rounded-xl border-2 border-ink/20 hover:border-ink hover:shadow-ink-sm transition-all"
            >
              <span className="text-2xl" aria-hidden="true">🎯</span>
              <div>
                <p className="font-display text-sm text-ink">Letter Hunt</p>
                <p className="text-xs text-ink-muted font-body">Press the highlighted key as fast as you can</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <NameCard
        currentName={userData?.name ?? 'Unknown'}
        rerollsRemaining={rerollsRemaining}
        nameChangeRequested={userData?.nameChangeRequested ?? false}
        isInClass={isInClass}
      />

      <JoinClassCard />
    </div>
  )
}
