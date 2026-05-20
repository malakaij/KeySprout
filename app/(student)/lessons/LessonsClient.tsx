'use client'

import { useRouter } from 'next/navigation'
import { LessonCard } from '@/components/dashboard/LessonCard'
import type { LessonWithProgress, SectionWithLessons } from '@/types'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

const SECTION_COLORS: Record<string, string> = {
  'Home Row': 'text-emerald-400 border-emerald-800 bg-emerald-900/20',
  'Top Row': 'text-blue-400 border-blue-800 bg-blue-900/20',
  'Bottom Row': 'text-purple-400 border-purple-800 bg-purple-900/20',
  'Common Words': 'text-amber-400 border-amber-800 bg-amber-900/20',
  'Speed Building': 'text-red-400 border-red-800 bg-red-900/20',
}

const DEFAULT_SECTION_COLOR = 'text-slate-400 border-slate-700 bg-slate-800/40'

interface LessonsClientProps {
  courseTitle: string
  sections: SectionWithLessons[]
}

export function LessonsClient({ courseTitle, sections }: LessonsClientProps) {
  const router = useRouter()

  // Build a set of passed lesson global indices for sequential locking
  // A lesson is unlocked if: it is the very first lesson overall, or the previous lesson (by global order) has been passed
  const allLessons: LessonWithProgress[] = sections.flatMap((s) => s.lessons)
  const passedIds = new Set(allLessons.filter((l) => l.passed).map((l) => l.id))

  const isLocked = (lesson: LessonWithProgress, sectionIndex: number, lessonIndex: number) => {
    if (sectionIndex === 0 && lessonIndex === 0) return false
    // Find the previous lesson globally
    if (lessonIndex > 0) {
      const prevLesson = sections[sectionIndex].lessons[lessonIndex - 1]
      return !passedIds.has(prevLesson.id)
    }
    // First lesson of a new section — previous is last lesson of prior section
    const prevSection = sections[sectionIndex - 1]
    const prevLesson = prevSection.lessons[prevSection.lessons.length - 1]
    return !passedIds.has(prevLesson.id)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{courseTitle}</h1>
        <p className="text-slate-400 mt-1">Complete lessons in order to unlock the next one.</p>
      </div>

      {/* Personalized Practice */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-slate-800 rounded-xl border border-emerald-800 p-5">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-emerald-300">Personalized Practice</h2>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Get a custom typing exercise targeting your weak keys, generated just for you.
        </p>
        <Link
          href="/progress"
          className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          View your weak keys and practice &rarr;
        </Link>
      </div>

      {sections.map((section, sectionIndex) => {
        const colorClass = SECTION_COLORS[section.title] ?? DEFAULT_SECTION_COLOR
        const completedCount = section.lessons.filter((l) => l.passed).length

        return (
          <div key={section.id}>
            <div className={cn('rounded-xl border p-4 mb-4', colorClass)}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              {section.description && (
                <p className="text-sm opacity-80 mt-0.5">{section.description}</p>
              )}
              <p className="text-xs opacity-60 mt-1">
                {completedCount} / {section.lessons.length} completed
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {section.lessons.map((lesson, lessonIndex) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  sectionTitle={section.title}
                  locked={isLocked(lesson, sectionIndex, lessonIndex)}
                  onClick={() => router.push(`/lessons/${lesson.id}`)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
