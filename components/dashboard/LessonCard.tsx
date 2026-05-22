import { cn } from '@/lib/utils'
import { CheckCircle, Lock, ChevronRight } from 'lucide-react'
import type { LessonWithProgress } from '@/types'

interface LessonCardProps {
  lesson: LessonWithProgress
  sectionTitle: string
  locked: boolean
  onClick: () => void
}

export function LessonCard({ lesson, sectionTitle: _sectionTitle, locked, onClick }: LessonCardProps) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={cn(
        'w-full text-left rounded-2xl p-4 border-[3px] transition-all',
        locked
          ? 'bg-paper-dark border-ink/10 opacity-60 cursor-not-allowed'
          : lesson.passed
            ? 'bg-paper border-mint cursor-pointer hover:shadow-ink-sm hover:translate-x-0.5 hover:translate-y-0.5'
            : 'bg-paper border-ink cursor-pointer hover:shadow-ink-sm hover:translate-x-0.5 hover:translate-y-0.5'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {locked ? (
            <Lock className="w-5 h-5 text-ink/20" />
          ) : lesson.passed ? (
            <CheckCircle className="w-5 h-5 text-mint" />
          ) : (
            <div className="w-5 h-5 rounded-full border-[3px] border-ink/30" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-ink text-sm">{lesson.title}</h3>
          {lesson.description && (
            <p className="text-xs text-ink/50 mt-0.5 line-clamp-2 font-body">{lesson.description}</p>
          )}

          {lesson.attempts > 0 && (
            <div className="flex gap-3 mt-2 text-xs text-ink/40 font-body">
              <span>Best: <span className="text-mint font-semibold">{Math.round(lesson.bestWpm ?? 0)} WPM</span></span>
              <span>Acc: <span className="text-sky font-semibold">{Math.round((lesson.bestAccuracy ?? 0) * 100)}%</span></span>
              <span>{lesson.attempts} attempt{lesson.attempts !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {!locked && (
          <ChevronRight className="w-4 h-4 text-ink/30 flex-shrink-0 mt-1" />
        )}
      </div>
    </button>
  )
}
