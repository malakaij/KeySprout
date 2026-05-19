'use client'

import { useRouter } from 'next/navigation'
import { LessonCard } from '@/components/dashboard/LessonCard'
import { UNITS } from '@/lib/curriculum'
import type { LessonWithProgress } from '@/types'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

const UNIT_COLORS: Record<string, string> = {
  'Home Row': 'text-emerald-400 border-emerald-800 bg-emerald-900/20',
  'Top Row': 'text-blue-400 border-blue-800 bg-blue-900/20',
  'Bottom Row': 'text-purple-400 border-purple-800 bg-purple-900/20',
  'Common Words': 'text-amber-400 border-amber-800 bg-amber-900/20',
  'Speed Building': 'text-red-400 border-red-800 bg-red-900/20',
}

interface LessonsClientProps {
  lessons: LessonWithProgress[]
}

export function LessonsClient({ lessons }: LessonsClientProps) {
  const router = useRouter()

  const lessonsByUnit = UNITS.map((unit) => ({
    unit,
    lessons: lessons.filter((l) => l.unit === unit.name).sort((a, b) => a.order - b.order),
  }))

  const passedOrders = new Set(
    lessons.filter((l) => l.passed).map((l) => l.order)
  )

  const isLocked = (lesson: LessonWithProgress) => {
    if (lesson.order === 1) return false
    return !passedOrders.has(lesson.order - 1)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Lessons</h1>
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
          View your weak keys and practice →
        </Link>
      </div>

      {lessonsByUnit.map(({ unit, lessons: unitLessons }) => (
        <div key={unit.name}>
          <div className={cn('rounded-xl border p-4 mb-4', UNIT_COLORS[unit.name])}>
            <h2 className="text-lg font-semibold">{unit.name}</h2>
            <p className="text-sm opacity-80 mt-0.5">{unit.description}</p>
            <p className="text-xs opacity-60 mt-1">
              {unitLessons.filter((l) => l.passed).length} / {unitLessons.length} completed
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {unitLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                locked={isLocked(lesson)}
                onClick={() => router.push(`/lessons/${lesson.id}`)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
