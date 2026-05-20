'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TypingArea } from '@/components/typing/TypingArea'
import { KeyboardHint } from '@/components/ui/KeyboardHint'
import { Pip } from '@/components/ui/Pip'
import { ArrowLeft, ArrowRight, RefreshCw, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LessonData {
  id: string
  title: string
  description: string | null
  content: string | null
  sectionTitle: string
  courseTitle: string
  targetKeys: string[]
  minWpm: number | null
  minAccuracy: number | null
  order: number
}

interface LessonClientProps {
  lesson: LessonData
  nextLesson: { id: string; title: string } | null
  bestWpm: number
  previouslyPassed: boolean
}

interface TypingResult {
  wpm: number
  accuracy: number
  duration: number
  errors: number
  charErrors: Record<string, number>
}

const SECTION_COLORS: Record<string, string> = {
  'Home Row': 'bg-mint/30 text-ink border-mint',
  'Top Row': 'bg-sky/30 text-ink border-sky',
  'Bottom Row': 'bg-grape/30 text-ink border-grape',
  'Common Words': 'bg-sunny/30 text-ink border-sunny',
  'Speed Building': 'bg-coral/30 text-ink border-coral',
}

export function LessonClient({ lesson, nextLesson, bestWpm, previouslyPassed }: LessonClientProps) {
  const router = useRouter()
  const [result, setResult] = useState<TypingResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [key, setKey] = useState(0)
  const [currentChar, setCurrentChar] = useState<string>(lesson.content?.[0] ?? '')

  const passed = result
    ? (!lesson.minWpm || result.wpm >= lesson.minWpm) &&
      (!lesson.minAccuracy || result.accuracy >= lesson.minAccuracy)
    : false

  const handleComplete = async (r: TypingResult) => {
    setResult(r)
    setSaving(true)
    try {
      await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wpm: r.wpm,
          accuracy: r.accuracy,
          duration: r.duration,
          errors: r.errors,
        }),
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setSaved(false)
    setKey((k) => k + 1)
    setCurrentChar(lesson.content?.[0] ?? '')
  }

  const handleProgress = (_wpm: number, _accuracy: number) => {
    // Could update live stats here if needed
  }

  const weakKeys = result
    ? Object.entries(result.charErrors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k)
    : []

  const sectionColor = SECTION_COLORS[lesson.sectionTitle] ?? 'bg-slate-700 text-slate-400'

  if (!lesson.content) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-ink/50">This lesson has no content yet.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/lessons" className="text-ink/40 hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs px-2 py-0.5 rounded-full border-2 font-semibold', sectionColor)}>
              {lesson.sectionTitle}
            </span>
            <span className="text-xs text-ink/50 font-body">Lesson {lesson.order + 1}</span>
            {previouslyPassed && (
              <span className="text-xs text-mint flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3 h-3" /> Passed
              </span>
            )}
          </div>
          <h1 className="text-xl font-display text-ink">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-sm text-ink/50 mt-0.5 font-body">{lesson.description}</p>
          )}
        </div>
        {bestWpm > 0 && (
          <div className="text-right">
            <p className="text-xs text-ink/40 font-body">Best WPM</p>
            <p className="text-lg font-display text-mint">{Math.round(bestWpm)}</p>
          </div>
        )}
      </div>

      {/* Target Keys */}
      {lesson.targetKeys.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lesson.targetKeys.map((k) => (
            <span
              key={k}
              className="kq-chip bg-sunny/30 border-ink/40 text-ink font-mono"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {/* Goals */}
      {(lesson.minWpm || lesson.minAccuracy) && (
        <div className="flex gap-4 text-sm text-ink/60 font-body">
          {lesson.minWpm && <span>Goal: <span className="text-mint font-bold">{lesson.minWpm} WPM</span></span>}
          {lesson.minAccuracy && <span>Accuracy: <span className="text-sky font-bold">{Math.round(lesson.minAccuracy * 100)}%</span></span>}
        </div>
      )}

      {/* Typing Area */}
      <TypingArea
        key={key}
        text={lesson.content}
        onComplete={handleComplete}
        onProgress={handleProgress}
        onCurrentChar={setCurrentChar}
      />

      {/* Keyboard Hint */}
      {!result && (
        <div className="kq-card p-4 flex flex-col items-center">
          <KeyboardHint nextKey={currentChar} />
        </div>
      )}

      {/* Results Modal */}
      {result && (
        <div className="kq-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            {passed ? (
              <Pip size="md" variant="celebrate" className="flex-shrink-0" />
            ) : (
              <XCircle className="w-10 h-10 text-coral flex-shrink-0" />
            )}
            <div>
              <h2 className="text-lg font-display text-ink">
                {passed ? 'Lesson Passed! 🎉' : 'Not quite — keep trying!'}
              </h2>
              <p className="text-sm text-ink/50 font-body">
                {passed ? 'Great job! You met the requirements.' : `Keep practicing to reach ${lesson.minWpm} WPM and ${Math.round((lesson.minAccuracy ?? 0.9) * 100)}% accuracy.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-mint/20 rounded-xl border-2 border-ink/20 p-3 text-center">
              <p className="text-2xl font-display text-mint">{result.wpm}</p>
              <p className="text-xs text-ink/50 font-body">WPM</p>
            </div>
            <div className="bg-sky/20 rounded-xl border-2 border-ink/20 p-3 text-center">
              <p className="text-2xl font-display text-sky">{Math.round(result.accuracy * 100)}%</p>
              <p className="text-xs text-ink/50 font-body">Accuracy</p>
            </div>
            <div className="bg-sunny/20 rounded-xl border-2 border-ink/20 p-3 text-center">
              <p className="text-2xl font-display text-ink">{result.duration}s</p>
              <p className="text-xs text-ink/50 font-body">Duration</p>
            </div>
            <div className="bg-coral/20 rounded-xl border-2 border-ink/20 p-3 text-center">
              <p className="text-2xl font-display text-coral">{result.errors}</p>
              <p className="text-xs text-ink/50 font-body">Errors</p>
            </div>
          </div>

          {saving && <p className="text-xs text-ink/40 text-center font-body">Saving result...</p>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRetry}
              className="kq-btn bg-paper-dark text-ink flex items-center gap-2 px-4 py-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>

            {weakKeys.length > 0 && saved && (
              <button
                onClick={async () => {
                  const res = await fetch('/api/lessons/dynamic', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ weakKeys }),
                  })
                  if (res.ok) {
                    handleRetry()
                  }
                }}
                className="kq-btn bg-sunny text-ink flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Practice Weak Keys
              </button>
            )}

            {passed && nextLesson && (
              <button
                onClick={() => router.push(`/lessons/${nextLesson.id}`)}
                className="kq-btn bg-mint text-ink flex items-center gap-2 px-4 py-2 text-sm ml-auto"
              >
                Next Lesson
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
