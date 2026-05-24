'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TypingArea } from '@/components/typing/TypingArea'
import { KeyboardHint } from '@/components/ui/KeyboardHint'
import { Pip } from '@/components/ui/Pip'
import { KeyboardGuard } from '@/components/keyboard/KeyboardGuard'
import { ArrowLeft, ArrowRight, RefreshCw, Sparkles, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useTypingFontSize, type TypingFontSize } from '@/hooks/useTypingFontSize'

const SIZES: { label: string; value: TypingFontSize }[] = [
  { label: 'S', value: 18 },
  { label: 'M', value: 28 },
  { label: 'L', value: 40 },
  { label: 'XL', value: 56 },
]

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

const SECTION_ACCENT: Record<string, { color: string; tint: string }> = {
  'Home Row':       { color: 'var(--color-mint)',  tint: 'rgba(77,212,172,0.25)' },
  'Top Row':        { color: 'var(--color-sky)',   tint: 'rgba(78,168,222,0.25)' },
  'Bottom Row':     { color: 'var(--color-grape)', tint: 'rgba(155,93,229,0.2)' },
  'Common Words':   { color: 'var(--color-sunny)', tint: 'rgba(255,210,63,0.3)' },
  'Speed Building': { color: 'var(--color-coral)', tint: 'rgba(255,94,91,0.2)' },
}

/** Returns design-token color and tint for a section title. */
function getSectionAccent(title: string) {
  return SECTION_ACCENT[title] ?? { color: 'var(--color-sky)', tint: 'rgba(78,168,222,0.25)' }
}

/** Formats elapsed seconds as M:SS. */
function formatElapsed(secs: number): string {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}

export function LessonClient({ lesson, nextLesson, bestWpm }: LessonClientProps) {
  const router = useRouter()
  const { fontSize, setFontSize } = useTypingFontSize()
  const [result, setResult] = useState<TypingResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [key, setKey] = useState(0)
  const [currentChar, setCurrentChar] = useState<string>(lesson.content?.[0] ?? '')
  const [showStats, setShowStats] = useState(true)
  const [liveWpm, setLiveWpm] = useState(0)
  const [liveAccuracy, setLiveAccuracy] = useState(1)
  const [liveErrors, setLiveErrors] = useState(0)
  const [liveElapsed, setLiveElapsed] = useState(0)
  const [typedCount, setTypedCount] = useState(0)

  const passed = result
    ? (!lesson.minWpm || result.wpm >= lesson.minWpm) &&
      (!lesson.minAccuracy || result.accuracy >= lesson.minAccuracy)
    : false

  const { color: sectionColor, tint: sectionTint } = getSectionAccent(lesson.sectionTitle)

  const progress = result
    ? 100
    : lesson.content
      ? (typedCount / lesson.content.length) * 100
      : 0

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
    setLiveWpm(0)
    setLiveAccuracy(1)
    setLiveErrors(0)
    setLiveElapsed(0)
    setTypedCount(0)
  }

  const weakKeys = result
    ? Object.entries(result.charErrors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k]) => k)
    : []

  if (!lesson.content) {
    return (
      <div style={{ padding: '24px', maxWidth: 768, margin: '0 auto' }}>
        <p style={{ color: 'var(--color-ink-muted)' }}>This lesson has no content yet.</p>
      </div>
    )
  }

  return (
    <KeyboardGuard>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 4rem)' }}>

        {/* TOP BAR */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(26,26,46,0.08)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/lessons" style={{ width: 36, height: 36, borderRadius: 9999, border: '2px solid #1a1a2e', background: 'var(--color-paper-dark)', boxShadow: '2px 2px 0 #1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span className="kq-chip text-xs" style={{ background: sectionTint, border: `2px solid ${sectionColor}`, boxShadow: 'none' }}>
                {lesson.sectionTitle}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>
                Lesson {lesson.order + 1}{lesson.minWpm ? ` · Goal ${lesson.minWpm} WPM` : ''}{lesson.minAccuracy ? ` · ${Math.round(lesson.minAccuracy * 100)}% acc` : ''}
              </span>
            </div>
            <h1 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {lesson.title}
            </h1>
          </div>

          {/* S/M/L/XL size selector — segmented pill control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--color-ink-muted)' }}>Size</span>
            <div style={{ display: 'inline-flex', border: '2px solid #1a1a2e', borderRadius: 9999, background: 'var(--color-paper-dark)', overflow: 'hidden', boxShadow: '2px 2px 0 #1a1a2e' }}>
              {SIZES.map(s => (
                <button key={s.label} onClick={() => setFontSize(s.value)}
                  style={{ padding: '4px 10px', minWidth: 36, background: fontSize === s.value ? 'var(--color-mint)' : 'transparent', color: '#1a1a2e', border: 'none', cursor: 'pointer', fontFamily: 'Fredoka One, cursive', fontSize: s.label === 'S' ? 11 : s.label === 'M' ? 13 : s.label === 'L' ? 15 : 17 }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live stats toggle */}
          <button onClick={() => setShowStats(!showStats)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 9999, border: '2px solid #1a1a2e', background: 'var(--color-paper-dark)', boxShadow: '2px 2px 0 #1a1a2e', cursor: 'pointer', color: '#1a1a2e', fontWeight: 600, fontSize: 12 }}>
            Live stats
            <span style={{ width: 28, height: 16, borderRadius: 9999, background: showStats ? 'var(--color-mint)' : 'rgba(26,26,46,0.15)', border: '2px solid #1a1a2e', position: 'relative', display: 'inline-block' }}>
              <span style={{ position: 'absolute', top: 0, left: showStats ? 12 : 0, width: 8, height: 8, borderRadius: '50%', background: '#1a1a2e', transition: 'left 100ms', margin: 2 }} />
            </span>
          </button>

          {/* Best WPM */}
          {bestWpm > 0 && (
            <div style={{ textAlign: 'right', minWidth: 64 }}>
              <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', margin: 0 }}>Best</p>
              <p style={{ fontFamily: 'Fredoka One, cursive', fontSize: 16, color: 'var(--color-mint)', lineHeight: 1, margin: 0 }}>{Math.round(bestWpm)} wpm</p>
            </div>
          )}
        </div>

        {/* PROGRESS BAR */}
        <div style={{ height: 4, background: 'rgba(26,26,46,0.08)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-mint)', transition: 'width 200ms' }} />
        </div>

        {/* TEXT AREA — flex-1 */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '32px 64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {result ? (
            <div style={{ maxWidth: 576, width: '100%' }}>
              {/* Result card */}
              <div className="kq-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  {passed ? (
                    <Pip size="md" variant="celebrate" />
                  ) : (
                    <XCircle style={{ width: 40, height: 40, color: 'var(--color-coral)', flexShrink: 0 }} />
                  )}
                  <div>
                    <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20, color: '#1a1a2e', margin: '0 0 4px' }}>
                      {passed ? 'Lesson Passed!' : 'Not quite — keep trying!'}
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--color-ink-muted)', fontFamily: 'Nunito, sans-serif', margin: 0 }}>
                      {passed
                        ? 'Great job! You met the requirements.'
                        : `Keep practicing to reach ${lesson.minWpm} WPM and ${Math.round((lesson.minAccuracy ?? 0.9) * 100)}% accuracy.`}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(77,212,172,0.2)', borderRadius: 12, border: '2px solid rgba(26,26,46,0.2)', padding: 12, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Fredoka One, cursive', fontSize: 24, color: 'var(--color-mint)', margin: '0 0 2px' }}>{result.wpm}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontFamily: 'Nunito, sans-serif', margin: 0 }}>WPM</p>
                  </div>
                  <div style={{ background: 'rgba(78,168,222,0.2)', borderRadius: 12, border: '2px solid rgba(26,26,46,0.2)', padding: 12, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Fredoka One, cursive', fontSize: 24, color: 'var(--color-sky)', margin: '0 0 2px' }}>{Math.round(result.accuracy * 100)}%</p>
                    <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontFamily: 'Nunito, sans-serif', margin: 0 }}>Accuracy</p>
                  </div>
                  <div style={{ background: 'rgba(255,210,63,0.2)', borderRadius: 12, border: '2px solid rgba(26,26,46,0.2)', padding: 12, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Fredoka One, cursive', fontSize: 24, color: '#1a1a2e', margin: '0 0 2px' }}>{result.duration}s</p>
                    <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontFamily: 'Nunito, sans-serif', margin: 0 }}>Duration</p>
                  </div>
                  <div style={{ background: 'rgba(255,94,91,0.2)', borderRadius: 12, border: '2px solid rgba(26,26,46,0.2)', padding: 12, textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Fredoka One, cursive', fontSize: 24, color: 'var(--color-coral)', margin: '0 0 2px' }}>{result.errors}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontFamily: 'Nunito, sans-serif', margin: 0 }}>Errors</p>
                  </div>
                </div>

                {saving && <p style={{ fontSize: 12, color: 'var(--color-ink-muted)', textAlign: 'center', fontFamily: 'Nunito, sans-serif', marginBottom: 12 }}>Saving result...</p>}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <button onClick={handleRetry} className="kq-btn" style={{ background: 'var(--color-paper-dark)', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14 }}>
                    <RefreshCw size={16} />
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
                        if (res.ok) handleRetry()
                      }}
                      className="kq-btn"
                      style={{ background: 'var(--color-sunny)', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14 }}
                    >
                      <Sparkles size={16} />
                      Practice Weak Keys
                    </button>
                  )}

                  {passed && nextLesson && (
                    <button
                      onClick={() => router.push(`/lessons/${nextLesson.id}`)}
                      className="kq-btn"
                      style={{ background: 'var(--color-mint)', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14, marginLeft: 'auto' }}
                    >
                      Next Lesson
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <TypingArea
              key={key}
              text={lesson.content}
              fontSize={fontSize}
              onComplete={handleComplete}
              onCurrentChar={setCurrentChar}
              onProgress={(wpm, acc, errs, elapsed, typedLen) => {
                setLiveWpm(wpm)
                setLiveAccuracy(acc)
                setLiveErrors(errs)
                setLiveElapsed(elapsed)
                setTypedCount(typedLen)
              }}
            />
          )}
        </div>

        {/* KEYBOARD GUIDE */}
        {!result && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(26,26,46,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
              <KeyboardHint nextKey={currentChar} />
            </div>
          </div>
        )}

        {/* STATS FOOTER */}
        {showStats && !result && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderTop: '1px solid rgba(26,26,46,0.08)', color: 'var(--color-ink-muted)', fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span><span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-mint)', fontWeight: 700 }}>{liveWpm}</span> wpm</span>
              <span><span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-sky)', fontWeight: 700 }}>{Math.round(liveAccuracy * 100)}</span>% acc</span>
              <span><span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-coral)', fontWeight: 700 }}>{liveErrors}</span> errors</span>
              <span><span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{formatElapsed(liveElapsed)}</span> elapsed</span>
            </div>
            <span>{lesson.minWpm ? `Goal ${lesson.minWpm} wpm` : ''}{lesson.minAccuracy ? ` · ${Math.round(lesson.minAccuracy * 100)}% acc` : ''}</span>
          </div>
        )}
      </div>
    </KeyboardGuard>
  )
}
