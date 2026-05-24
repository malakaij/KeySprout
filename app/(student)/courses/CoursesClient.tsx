'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BookOpen, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACCENT_TEXT: Record<string, string> = {
  grape: 'text-white',
  coral: 'text-white',
  sky: 'text-ink',
  mint: 'text-ink',
  sunny: 'text-ink',
  berry: 'text-white',
}

function accentBg(accent: string) {
  const map: Record<string, string> = {
    mint: 'bg-mint',
    sky: 'bg-sky',
    sunny: 'bg-sunny',
    grape: 'bg-grape',
    coral: 'bg-coral',
    berry: 'bg-berry',
  }
  return map[accent] ?? 'bg-mint'
}

function relativeTime(iso: string | null) {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface CourseCardProps {
  course: CourseData
  onEnroll: (id: string) => void
  enrolling: boolean
  /** Whether this is the single most-recently-active enrolled course. */
  isLatest: boolean
}

function CourseCard({ course, onEnroll, enrolling, isLatest }: CourseCardProps) {
  const pct = course.totalLessons > 0
    ? Math.round((course.startedLessons / course.totalLessons) * 100)
    : 0
  const bg = accentBg(course.accent)
  const textColor = ACCENT_TEXT[course.accent] ?? 'text-ink'

  return (
    <div className="kq-card overflow-hidden transition-all duration-100 hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_#1a1a2e]">
      {/* Hero band */}
      <div className={cn('p-5 flex items-center gap-3 border-b-[3px] border-ink', bg)}>
        <span style={{ fontSize: 40 }} aria-hidden="true">{course.icon}</span>
        <div className="min-w-0">
          <h2 className={cn('font-display text-lg leading-tight', textColor)}>{course.title}</h2>
          {course.subtitle && (
            <p className={cn('text-sm font-body mt-0.5 opacity-80', textColor)}>{course.subtitle}</p>
          )}
        </div>
        {isLatest && (
          <span className="ml-auto shrink-0 kq-chip bg-white/90 border-ink text-ink text-xs px-2 py-0.5">
            ★ Latest
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs font-body text-ink-muted mb-1.5">
            <span>Progress</span>
            <span>{course.startedLessons} / {course.totalLessons} lessons</span>
          </div>
          <div className="h-2.5 bg-paper-dark rounded-full border border-ink/10 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', bg)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        {course.isEnrolled && (
          <div className="flex gap-4 text-xs font-body text-ink-muted">
            {course.lastLessonAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                Last lesson {relativeTime(course.lastLessonAt)}
              </span>
            )}
            {course.enrolledAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" aria-hidden="true" />
                Enrolled {relativeTime(course.enrolledAt)}
              </span>
            )}
          </div>
        )}

        {/* Action */}
        {course.isEnrolled ? (
          <Link
            href="/lessons"
            className={cn('w-full kq-btn flex items-center justify-center gap-2 py-2.5 font-display text-sm', bg, textColor)}
          >
            Continue course →
          </Link>
        ) : (
          <button
            onClick={() => onEnroll(course.id)}
            disabled={enrolling}
            className="w-full kq-btn bg-paper-dark text-ink flex items-center justify-center gap-2 py-2.5 font-display text-sm disabled:opacity-50"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            {enrolling ? 'Enrolling...' : 'Start course'}
          </button>
        )}
      </div>
    </div>
  )
}

interface CourseData {
  id: string
  title: string
  subtitle: string | null
  icon: string
  accent: string
  totalLessons: number
  startedLessons: number
  isEnrolled: boolean
  lastLessonAt: string | null
  enrolledAt: string | null
}

interface Props {
  courses: CourseData[]
}

/** Courses index page — shows enrolled and available courses with progress. */
export function CoursesClient({ courses }: Props) {
  const router = useRouter()
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  const enrolledCount = courses.filter((c) => c.isEnrolled).length

  // The single most-recently-active enrolled course gets the ★ Latest chip.
  const latestCourseId = courses
    .filter((c) => c.isEnrolled && c.lastLessonAt)
    .sort((a, b) => new Date(b.lastLessonAt!).getTime() - new Date(a.lastLessonAt!).getTime())[0]?.id ?? null

  async function handleEnroll(courseId: string) {
    setEnrollingId(courseId)
    try {
      await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
      router.refresh()
    } finally {
      setEnrollingId(null)
    }
  }

  const sortedCourses = [...courses].sort((a, b) => {
    // Enrolled + recently active first
    if (a.isEnrolled && !b.isEnrolled) return -1
    if (!a.isEnrolled && b.isEnrolled) return 1
    if (a.lastLessonAt && b.lastLessonAt)
      return new Date(b.lastLessonAt).getTime() - new Date(a.lastLessonAt).getTime()
    return 0
  })

  return (
    <div className="p-6 max-w-[880px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display text-ink">Your Courses</h1>
        <p className="text-ink-muted font-body mt-1">
          {enrolledCount > 0
            ? `You're enrolled in ${enrolledCount} course${enrolledCount > 1 ? 's' : ''}. Pick one to keep going.`
            : 'Pick a course to start your typing journey.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {sortedCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={handleEnroll}
            enrolling={enrollingId === course.id}
            isLatest={course.id === latestCourseId}
          />
        ))}
      </div>

      <div className="kq-card p-5 bg-paper-dark flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-ink-muted mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-sm font-body text-ink-muted">
          Want to join a course assigned by your teacher?{' '}
          <Link href="/settings" className="text-ink underline underline-offset-2">
            Add a class code in Settings.
          </Link>
        </p>
      </div>
    </div>
  )
}
