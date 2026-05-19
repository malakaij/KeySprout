'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TypingArea } from '@/components/typing/TypingArea'
import { VirtualKeyboard } from '@/components/typing/VirtualKeyboard'
import { ArrowLeft, ArrowRight, RefreshCw, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  description: string | null
  content: string
  unit: string
  targetKeys: string[]
  minWpm: number | null
  minAccuracy: number | null
  level: number
  order: number
}

interface LessonClientProps {
  lesson: Lesson
  nextLesson: Lesson | null
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

const UNIT_COLORS: Record<string, string> = {
  'Home Row': 'bg-emerald-900/50 text-emerald-400',
  'Top Row': 'bg-blue-900/50 text-blue-400',
  'Bottom Row': 'bg-purple-900/50 text-purple-400',
  'Common Words': 'bg-amber-900/50 text-amber-400',
  'Speed Building': 'bg-red-900/50 text-red-400',
}

export function LessonClient({ lesson, nextLesson, bestWpm, previouslyPassed }: LessonClientProps) {
  const router = useRouter()
  const [result, setResult] = useState<TypingResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentKey, setCurrentKey] = useState<string | undefined>()
  const [key, setKey] = useState(0)

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

  const unitColor = UNIT_COLORS[lesson.unit] ?? 'bg-slate-700 text-slate-400'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/lessons" className="text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs px-2 py-0.5 rounded-full', unitColor)}>
              {lesson.unit}
            </span>
            <span className="text-xs text-slate-500">Lesson {lesson.order}</span>
            {previouslyPassed && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Passed
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-100">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-sm text-slate-400 mt-0.5">{lesson.description}</p>
          )}
        </div>
        {bestWpm > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Best WPM</p>
            <p className="text-lg font-bold text-emerald-400">{Math.round(bestWpm)}</p>
          </div>
        )}
      </div>

      {/* Target Keys */}
      {lesson.targetKeys.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {lesson.targetKeys.map((k) => (
            <span
              key={k}
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-sm font-mono font-bold text-amber-300"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {/* Goals */}
      {(lesson.minWpm || lesson.minAccuracy) && (
        <div className="flex gap-4 text-sm text-slate-400">
          {lesson.minWpm && <span>Goal: <span className="text-emerald-400">{lesson.minWpm} WPM</span></span>}
          {lesson.minAccuracy && <span>Accuracy: <span className="text-blue-400">{Math.round(lesson.minAccuracy * 100)}%</span></span>}
        </div>
      )}

      {/* Typing Area */}
      <TypingArea
        key={key}
        text={lesson.content}
        onComplete={handleComplete}
        onProgress={handleProgress}
      />

      {/* Virtual Keyboard */}
      {lesson.targetKeys.length > 0 && (
        <VirtualKeyboard
          highlightKey={currentKey ?? lesson.targetKeys[0]}
          fingerColors={true}
        />
      )}

      {/* Results Modal */}
      {result && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            {passed ? (
              <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {passed ? 'Lesson Passed! 🎉' : 'Not quite — keep trying!'}
              </h2>
              <p className="text-sm text-slate-400">
                {passed ? 'Great job! You met the requirements.' : `Keep practicing to reach ${lesson.minWpm} WPM and ${Math.round((lesson.minAccuracy ?? 0.9) * 100)}% accuracy.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{result.wpm}</p>
              <p className="text-xs text-slate-400">WPM</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{Math.round(result.accuracy * 100)}%</p>
              <p className="text-xs text-slate-400">Accuracy</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{result.duration}s</p>
              <p className="text-xs text-slate-400">Duration</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{result.errors}</p>
              <p className="text-xs text-slate-400">Errors</p>
            </div>
          </div>

          {saving && <p className="text-xs text-slate-500 text-center">Saving result...</p>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors text-sm"
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
                className="flex items-center gap-2 px-4 py-2 bg-amber-700/50 hover:bg-amber-700/70 text-amber-300 rounded-lg transition-colors text-sm border border-amber-800"
              >
                <Sparkles className="w-4 h-4" />
                Practice Weak Keys
              </button>
            )}

            {passed && nextLesson && (
              <button
                onClick={() => router.push(`/lessons/${nextLesson.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm ml-auto"
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
