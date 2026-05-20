import { cn } from '@/lib/utils'
import { CheckCircle, Lock, ChevronRight } from 'lucide-react'
import type { LessonWithProgress } from '@/types'

interface LessonCardProps {
  lesson: LessonWithProgress
  sectionTitle: string
  locked: boolean
  onClick: () => void
}

const SECTION_COLORS: Record<string, string> = {
  'Home Row': 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
  'Top Row': 'bg-blue-900/50 text-blue-400 border-blue-800',
  'Bottom Row': 'bg-purple-900/50 text-purple-400 border-purple-800',
  'Common Words': 'bg-amber-900/50 text-amber-400 border-amber-800',
  'Speed Building': 'bg-red-900/50 text-red-400 border-red-800',
}

export function LessonCard({ lesson, sectionTitle, locked, onClick }: LessonCardProps) {
  const sectionColor = SECTION_COLORS[sectionTitle] ?? 'bg-slate-700 text-slate-400 border-slate-600'

  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={cn(
        'w-full text-left bg-slate-800 rounded-xl p-4 border transition-all',
        locked
          ? 'border-slate-700 opacity-60 cursor-not-allowed'
          : lesson.passed
            ? 'border-emerald-700 hover:border-emerald-500 hover:bg-slate-750 cursor-pointer'
            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-750 cursor-pointer'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {locked ? (
            <Lock className="w-5 h-5 text-slate-500" />
          ) : lesson.passed ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs px-2 py-0.5 rounded-full border', sectionColor)}>
              {sectionTitle}
            </span>
          </div>
          <h3 className="font-semibold text-slate-100 text-sm">{lesson.title}</h3>
          {lesson.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{lesson.description}</p>
          )}

          {lesson.attempts > 0 && (
            <div className="flex gap-3 mt-2 text-xs text-slate-400">
              <span>Best: <span className="text-emerald-400 font-medium">{Math.round(lesson.bestWpm ?? 0)} WPM</span></span>
              <span>Acc: <span className="text-blue-400 font-medium">{Math.round((lesson.bestAccuracy ?? 0) * 100)}%</span></span>
              <span>{lesson.attempts} attempt{lesson.attempts !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {!locked && (
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
        )}
      </div>
    </button>
  )
}
