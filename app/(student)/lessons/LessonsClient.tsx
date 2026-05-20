'use client'

import { useRouter } from 'next/navigation'
import { LessonCard } from '@/components/dashboard/LessonCard'
import type { LessonWithProgress, SectionWithLessons } from '@/types'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

const SECTION_COLORS = [
  'bg-mint/20 border-mint text-ink',
  'bg-sky/20 border-sky text-ink',
  'bg-sunny/20 border-sunny text-ink',
  'bg-grape/20 border-grape text-ink',
  'bg-coral/20 border-coral text-ink',
  'bg-berry/20 border-berry text-ink',
]

interface LessonsClientProps {
  courseTitle: string
  sections: SectionWithLessons[]
}

export function LessonsClient({ courseTitle, sections }: LessonsClientProps) {
  const router = useRouter()

  const allLessons: LessonWithProgress[] = sections.flatMap((s) => s.lessons)
  const passedIds = new Set(allLessons.filter((l) => l.passed).map((l) => l.id))

  const isLocked = (lesson: LessonWithProgress, sectionIndex: number, lessonIndex: number) => {
    if (sectionIndex === 0 && lessonIndex === 0) return false
    if (lessonIndex > 0) {
      const prevLesson = sections[sectionIndex].lessons[lessonIndex - 1]
      return !passedIds.has(prevLesson.id)
    }
    const prevSection = sections[sectionIndex - 1]
    const prevLesson = prevSection.lessons[prevSection.lessons.length - 1]
    return !passedIds.has(prevLesson.id)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display text-ink">{courseTitle}</h1>
        <p className="text-ink/50 mt-1 font-body">Complete lessons in order to unlock the next one.</p>
      </div>

      {/* Personalized Practice */}
      <div className="kq-card p-5 bg-mint/10 border-mint">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-mint" />
          <h2 className="font-display text-ink">Personalized Practice</h2>
        </div>
        <p className="text-sm text-ink/50 mb-3 font-body">
          Get a custom typing exercise targeting your weak keys, generated just for you.
        </p>
        <Link
          href="/progress"
          className="inline-flex items-center gap-1 text-sm text-sky font-semibold hover:text-sky/70 transition-colors"
        >
          View your weak keys and practice &rarr;
        </Link>
      </div>

      {sections.map((section, sectionIndex) => {
        const colorClass = SECTION_COLORS[sectionIndex % SECTION_COLORS.length]
        const completedCount = section.lessons.filter((l) => l.passed).length

        return (
          <div key={section.id}>
            <div className={`rounded-2xl border-[3px] p-4 mb-4 ${colorClass}`}>
              <h2 className="text-lg font-display text-ink">{section.title}</h2>
              {section.description && (
                <p className="text-sm text-ink/60 mt-0.5 font-body">{section.description}</p>
              )}
              <p className="text-xs text-ink/40 mt-1 font-body">
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
