'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, Check, Lock } from 'lucide-react'
import { sectionColor } from '@/lib/section-colors'
import { Pip } from '@/components/ui/Pip'
import { UpNextCard } from '@/components/ui/UpNextCard'

export interface CourseTab {
  id: string
  title: string
  subtitle: string | null
  icon: string
  accent: string
  totalLessons: number
  passedLessons: number
  /** ISO date string of last lesson activity, or null. */
  lastLessonAt: string | null
}

function relativeTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export interface LessonDot {
  id: string
  order: number
  title: string
  description: string | null
  content: string | null
  passed: boolean
  attempted: boolean
  locked: boolean
  bestWpm: number | null
  bestAccuracy: number | null
  minWpm: number | null
  minAccuracy: number | null
  targetWpm: number | null
}

export interface SectionData {
  id: string
  title: string
  description: string | null
  order: number
  lessons: LessonDot[]
  passedCount: number
}

interface Props {
  courses: CourseTab[]
  activeCourseId: string
  activeCourseAccent: string
  sections: SectionData[]
  /** Keys from attempted-but-not-passed lessons; drives the Personalized Practice card. */
  weakKeys: string[]
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

/** Finds the section that should auto-open on load. */
function findAutoOpenSectionId(sections: SectionData[]): string | null {
  for (const section of sections) {
    const firstUnstarted = section.lessons.find((l) => !l.locked && !l.attempted && !l.passed)
    if (firstUnstarted) return section.id
  }
  return sections[0]?.id ?? null
}

/** Status label and color for a lesson dot. */
function lessonStatus(lesson: LessonDot): { label: string; color: string } {
  if (lesson.locked)    return { label: 'Locked',      color: 'var(--color-ink-muted)' }
  if (lesson.passed)    return { label: 'Passed',       color: 'var(--color-mint)' }
  if (lesson.attempted) return { label: 'In progress', color: 'var(--color-sunny)' }
  return                        { label: 'Up next',     color: 'var(--color-coral)' }
}

/** Returns the first "current" lesson ID: unlocked, not attempted, not passed. */
function findCurrentLessonId(sections: SectionData[]): string | null {
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (!lesson.locked && !lesson.attempted && !lesson.passed) return lesson.id
    }
  }
  return null
}

interface DetailPanelProps {
  lesson: LessonDot
  accent: string
  /** Description of the parent section, shown as body text in the panel. */
  sectionDescription: string | null
}

function DetailPanel({ lesson, accent, sectionDescription }: DetailPanelProps) {
  const { label: statusLabel, color: statusColor } = lessonStatus(lesson)

  // Body text: locked message takes priority, then section description.
  const bodyText = lesson.locked
    ? 'Finish the lessons before this one to unlock it.'
    : sectionDescription ?? null

  return (
    <div className="kq-card p-4 mt-2 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-base text-ink">{lesson.title}</p>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          border: `1.5px solid ${statusColor}`,
          background: `${statusColor}1a`,
          borderRadius: 999, padding: '2px 8px',
          fontSize: 11, color: statusColor, fontWeight: 700,
          whiteSpace: 'nowrap', fontFamily: 'Nunito, sans-serif',
        }}>
          {statusLabel}
        </span>
      </div>

      {bodyText && (
        <p className="text-sm font-body text-ink-muted italic">{bodyText}</p>
      )}

      {(lesson.minWpm || lesson.minAccuracy) && (
        <div className="flex gap-2 flex-wrap">
          {lesson.minWpm && (
            <span className="kq-chip bg-mint/20 border-mint text-ink text-xs">Goal {lesson.minWpm} WPM</span>
          )}
          {lesson.minAccuracy && (
            <span className="kq-chip bg-sky/20 border-sky text-ink text-xs">Accuracy {Math.round(lesson.minAccuracy * 100)}%</span>
          )}
        </div>
      )}

      {(lesson.bestWpm !== null || lesson.bestAccuracy !== null) && (
        <div className="flex gap-2 flex-wrap">
          {lesson.bestWpm !== null && (
            <span className="kq-chip bg-paper-dark text-ink text-xs">Your best: {Math.round(lesson.bestWpm)} WPM</span>
          )}
          {lesson.bestAccuracy !== null && (
            <span className="kq-chip bg-paper-dark text-ink text-xs">{Math.round(lesson.bestAccuracy * 100)}% accuracy</span>
          )}
        </div>
      )}

      {lesson.locked ? (
        <button
          disabled
          className="kq-btn bg-paper-dark text-ink-muted px-4 py-2 text-sm opacity-60 cursor-not-allowed"
        >
          Locked
        </button>
      ) : (
        <Link
          href={`/lessons/${lesson.id}`}
          className={`kq-btn ${accentBg(accent)} text-ink inline-flex items-center gap-1 px-4 py-2 text-sm font-display`}
        >
          {lesson.passed ? 'Practice again' : lesson.attempted ? 'Keep going' : 'Start lesson'} →
        </Link>
      )}
    </div>
  )
}

interface SectionAccordionProps {
  section: SectionData
  sectionIndex: number
  isOpen: boolean
  onToggle: () => void
  selectedDot: { sectionId: string; lessonId: string } | null
  onSelectDot: (sectionId: string, lessonId: string) => void
  accent: string
  /** The ID of the current (first unlocked/unattempted/unpassed) lesson across all sections. */
  currentLessonId: string | null
}

function SectionAccordion({
  section,
  sectionIndex,
  isOpen,
  onToggle,
  selectedDot,
  onSelectDot,
  accent,
  currentLessonId,
}: SectionAccordionProps) {
  const c = sectionColor(sectionIndex)
  const selectedLesson =
    selectedDot?.sectionId === section.id
      ? section.lessons.find((l) => l.id === selectedDot.lessonId) ?? null
      : null

  return (
    <div className={`rounded-2xl border-[3px] ${c.border} overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 p-4 ${c.bg} text-left cursor-pointer`}
        aria-expanded={isOpen}
      >
        <span style={{
          fontFamily: "'Fredoka One', cursive",
          fontSize: 14,
          background: c.hex,
          color: c.accentText === 'text-white' ? 'white' : '#1a1a2e',
          border: '2px solid #1a1a2e',
          boxShadow: '2px 2px 0 #1a1a2e',
          borderRadius: 8,
          padding: '3px 10px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {section.title}
        </span>
        <div className="flex-1" />
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs font-body text-ink-muted">
            {section.passedCount} of {section.lessons.length} passed
          </span>
          <div style={{
            width: 80, height: 6, borderRadius: 9999,
            background: 'rgba(26,26,46,0.12)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 9999,
              width: `${section.lessons.length > 0 ? Math.round((section.passedCount / section.lessons.length) * 100) : 0}%`,
              background: c.hex,
              transition: 'width 300ms',
            }} />
          </div>
        </div>
        <ChevronDown
          className="w-4 h-4 text-ink shrink-0 transition-transform duration-180"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="bg-paper p-4 border-t-[3px] border-inherit">
          <div className="flex flex-wrap gap-3">
            {section.lessons.map((lesson) => {
              const isSelected =
                selectedDot?.sectionId === section.id && selectedDot.lessonId === lesson.id
              const isCurrent = lesson.id === currentLessonId

              // Determine dot state
              const isPassed = lesson.passed
              const isAttempted = !lesson.passed && lesson.attempted
              const isLocked = lesson.locked

              // Build inline styles for the 52×52 dot button
              const baseStyle: React.CSSProperties = {
                width: 52,
                height: 52,
                borderRadius: 9999,
                border: isSelected ? '4px solid #1a1a2e' : '3px solid #1a1a2e',
                boxShadow: isSelected
                  ? '5px 5px 0 #1a1a2e'
                  : isLocked
                  ? 'none'
                  : '3px 3px 0 #1a1a2e',
                transform: isSelected ? 'translate(-1px, -1px)' : undefined,
                opacity: isLocked ? 0.55 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'box-shadow 100ms, transform 100ms, border-width 100ms',
                // Background color per state
                background: isLocked
                  ? 'var(--color-paper-dark)'
                  : isAttempted
                  ? 'var(--color-sunny)'
                  : isCurrent
                  ? 'var(--color-coral)'
                  : undefined,
              }

              // For passed dots we use a Tailwind class for the section solid color
              const passedBgClass = isPassed ? c.solid : ''

              const displayNumber = lesson.order + 1

              return (
                <button
                  key={lesson.id}
                  disabled={isLocked}
                  title={lesson.title}
                  aria-label={`${lesson.title}${isPassed ? ' (passed)' : isAttempted ? ' (in progress)' : isLocked ? ' (locked)' : ''}`}
                  onClick={() => !isLocked && onSelectDot(section.id, lesson.id)}
                  style={baseStyle}
                  className={`${passedBgClass} ${isCurrent && !isSelected ? 'lesson-dot-current' : ''}`}
                >
                  {isPassed && (
                    <Check size={16} color="white" strokeWidth={3} aria-hidden="true" />
                  )}
                  {(isCurrent || isAttempted) && (
                    <span
                      style={{
                        fontFamily: "'Fredoka One', cursive",
                        fontSize: 14,
                        color: isCurrent ? 'white' : '#1a1a2e',
                        lineHeight: 1,
                        userSelect: 'none',
                      }}
                    >
                      {displayNumber}
                    </span>
                  )}
                  {isLocked && !isPassed && !isCurrent && !isAttempted && (
                    <Lock size={14} style={{ color: 'rgba(26,26,46,0.55)' }} aria-hidden="true" />
                  )}
                  {/* Attempted badge dot */}
                  {isAttempted && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: 9999,
                        background: 'var(--color-coral)',
                        border: '1.5px solid #1a1a2e',
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {selectedLesson && (
            <DetailPanel lesson={selectedLesson} accent={accent} sectionDescription={section.description} />
          )}
        </div>
      )}
    </div>
  )
}

/** Computes the Up Next lesson data for the UpNextCard. */
function findUpNextLesson(sections: SectionData[]): { lesson: LessonDot; sectionTitle: string } | null {
  // First: first unlocked, not attempted, not passed
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (!lesson.locked && !lesson.passed && !lesson.attempted) {
        return { lesson, sectionTitle: section.title }
      }
    }
  }
  // Fallback: first unlocked, not passed (i.e. attempted but not passed)
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (!lesson.locked && !lesson.passed) {
        return { lesson, sectionTitle: section.title }
      }
    }
  }
  return null
}

/** Lessons page — course switcher tabs + section accordions with lesson dot navigation. */
export function LessonsClient({ courses, activeCourseId, activeCourseAccent, sections, weakKeys }: Props) {
  const router = useRouter()

  const activeCourse = courses.find((c) => c.id === activeCourseId)

  const [openSectionId, setOpenSectionId] = useState<string | null>(() =>
    findAutoOpenSectionId(sections)
  )
  const [selectedDot, setSelectedDot] = useState<{ sectionId: string; lessonId: string } | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    function onOutsideClick(e: MouseEvent) {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [pickerOpen])

  // Re-compute auto-open when sections change (course switch)
  useEffect(() => {
    setOpenSectionId(findAutoOpenSectionId(sections))
    setSelectedDot(null)
  }, [sections])

  function toggleSection(sectionId: string) {
    setOpenSectionId((prev) => {
      if (prev === sectionId) {
        if (selectedDot?.sectionId === sectionId) setSelectedDot(null)
        return null
      }
      return sectionId
    })
  }

  function handleSelectDot(sectionId: string, lessonId: string) {
    setSelectedDot((prev) =>
      prev?.sectionId === sectionId && prev.lessonId === lessonId ? null : { sectionId, lessonId },
    )
  }

  const currentLessonId = findCurrentLessonId(sections)
  const upNextData = findUpNextLesson(sections)

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Pulse-ring keyframes for the current lesson dot */}
      <style suppressHydrationWarning>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 3px 3px 0 #1a1a2e, 0 0 0 0 rgba(255,94,91,0.55); }
          70%  { box-shadow: 3px 3px 0 #1a1a2e, 0 0 0 8px rgba(255,94,91,0); }
          100% { box-shadow: 3px 3px 0 #1a1a2e, 0 0 0 0 rgba(255,94,91,0); }
        }
        .lesson-dot-current {
          animation: pulse-ring 1.8s ease-out infinite;
        }
      `}</style>

      {/* Course switcher — dropdown button (always shown so students know which course they're in) */}
      <div ref={pickerRef} style={{ position: 'relative', alignSelf: 'flex-start' }}>
        <button
          onClick={() => setPickerOpen((p) => !p)}
          className={`kq-btn flex items-center gap-2 px-4 py-2 text-sm font-display ${accentBg(activeCourseAccent)} text-ink`}
          aria-haspopup="listbox"
          aria-expanded={pickerOpen}
        >
          <span aria-hidden="true">{activeCourse?.icon}</span>
          {activeCourse?.title}
          <ChevronDown
            className="w-4 h-4 transition-transform duration-150"
            style={{ transform: pickerOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {pickerOpen && (
          <div
            role="listbox"
            aria-label="Select course"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30,
              minWidth: 300, background: 'var(--color-paper)',
              border: '3px solid #1a1a2e', borderRadius: 14,
              boxShadow: '4px 4px 0 #1a1a2e', overflow: 'hidden',
            }}
          >
            {courses.map((course, i) => {
              const isActive = course.id === activeCourseId
              return (
                <button
                  key={course.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setPickerOpen(false)
                    if (!isActive) router.push(`/lessons?course=${course.id}`)
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                    background: isActive ? 'rgba(77,212,172,0.12)' : 'transparent',
                    borderBottom: i < courses.length - 1 ? '1px solid rgba(26,26,46,0.08)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{course.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Fredoka One, cursive', fontSize: 14, color: '#1a1a2e', margin: 0 }}>
                      {course.title}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-ink-muted)', fontFamily: 'Nunito, sans-serif', margin: 0 }}>
                      {course.passedLessons}/{course.totalLessons} lessons
                      {course.lastLessonAt ? ` · last ${relativeTime(course.lastLessonAt)}` : ''}
                    </p>
                  </div>
                  {isActive && <Check size={15} style={{ color: 'var(--color-mint)', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Course subtitle */}
      {activeCourse?.subtitle && (
        <p className="text-sm font-body text-ink-muted -mt-3">{activeCourse.subtitle}</p>
      )}

      {/* Up Next card */}
      {upNextData && activeCourse && (
        <UpNextCard
          courseTitle={activeCourse.title}
          courseIcon={activeCourse.icon}
          courseAccent={activeCourseAccent}
          sectionTitle={upNextData.sectionTitle}
          lessonTitle={upNextData.lesson.title}
          lessonId={upNextData.lesson.id}
          lessonOrder={upNextData.lesson.order + 1}
          minWpm={upNextData.lesson.minWpm}
          minAccuracy={upNextData.lesson.minAccuracy}
        />
      )}

      {/* Personalized Practice card */}
      {weakKeys.length > 0 && (
        <div className="kq-card p-5 flex items-center gap-4" style={{ background: 'rgba(77,212,172,0.12)' }}>
          <Pip size="md" variant="wave" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-display text-base text-ink">Personalized Practice</p>
            <p className="text-sm font-body text-ink-muted mt-0.5">
              Pip noticed you&apos;re working on{' '}
              {weakKeys.map((k, i) => (
                <span key={k}>
                  <strong>{k}</strong>{i < weakKeys.length - 1 ? ', ' : ''}
                </span>
              ))}
              {' '}— want a custom drill?
            </p>
          </div>
          <button
            onClick={async () => {
              const res = await fetch('/api/lessons/dynamic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weakKeys }),
              })
              if (res.ok) router.push('/lessons/dynamic')
            }}
            className="kq-btn bg-mint text-ink px-4 py-2 text-sm font-display shrink-0"
          >
            Practice weak keys
          </button>
        </div>
      )}

      {/* Section accordions */}
      <div className="space-y-3">
        {sections.map((section, sectionIndex) => (
          <SectionAccordion
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            isOpen={openSectionId === section.id}
            onToggle={() => toggleSection(section.id)}
            selectedDot={selectedDot}
            onSelectDot={handleSelectDot}
            accent={activeCourseAccent}
            currentLessonId={currentLessonId}
          />
        ))}
      </div>

      {/* Dot legend */}
      <div className="flex flex-wrap gap-4 pt-1" aria-label="Lesson status legend">
        {[
          { label: 'Passed',      bg: 'bg-mint',       border: 'border-mint' },
          { label: 'Up next',     bg: 'bg-coral',      border: 'border-coral' },
          { label: 'In progress', bg: 'bg-sunny',      border: 'border-sunny' },
          { label: 'Locked',      bg: 'bg-paper-dark', border: 'border-ink/30' },
        ].map(({ label, bg, border }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-ink-muted font-body">
            <span className={`w-3 h-3 rounded-full border-2 ${bg} ${border} inline-block`} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
