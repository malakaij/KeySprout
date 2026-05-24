'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { sectionColor } from '@/lib/section-colors'
import { Pip } from '@/components/ui/Pip'

export interface CourseTab {
  id: string
  title: string
  subtitle: string | null
  icon: string
  accent: string
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
  if (lesson.locked)   return { label: 'Locked',      color: 'var(--color-ink-muted)' }
  if (lesson.passed)   return { label: 'Passed',       color: 'var(--color-mint)' }
  if (lesson.attempted) return { label: 'In progress', color: 'var(--color-sunny)' }
  return                       { label: 'Up next',     color: 'var(--color-coral)' }
}

interface DetailPanelProps {
  lesson: LessonDot
  accent: string
}

function DetailPanel({ lesson, accent }: DetailPanelProps) {
  const preview = lesson.content ? lesson.content.slice(0, 120) : null
  const truncated = lesson.content && lesson.content.length > 120
  const { label: statusLabel, color: statusColor } = lessonStatus(lesson)

  return (
    <div className="kq-card p-4 mt-2 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-base text-ink">{lesson.title}</p>
        <span style={{ fontSize: 11, color: statusColor, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'Nunito, sans-serif' }}>
          {statusLabel}
        </span>
      </div>

      {preview && (
        <p className="text-sm font-body text-ink-muted italic">
          {preview}{truncated ? '…' : ''}
        </p>
      )}

      {(lesson.bestWpm !== null || lesson.bestAccuracy !== null) && (
        <div className="flex gap-2 flex-wrap">
          {lesson.bestWpm !== null && (
            <span className="kq-chip bg-paper-dark text-ink text-xs">
              ⚡ {Math.round(lesson.bestWpm)} wpm
            </span>
          )}
          {lesson.bestAccuracy !== null && (
            <span className="kq-chip bg-paper-dark text-ink text-xs">
              ✓ {Math.round(lesson.bestAccuracy)}%
            </span>
          )}
        </div>
      )}

      {(lesson.minWpm || lesson.targetWpm) && (
        <p className="text-xs text-ink-muted font-body">
          Goal:{lesson.targetWpm ? ` ${lesson.targetWpm} wpm` : ''}{lesson.minWpm && lesson.targetWpm ? ' ·' : ''}{lesson.minWpm ? ` ${lesson.minWpm} wpm min` : ''}
        </p>
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
}

function SectionAccordion({
  section,
  sectionIndex,
  isOpen,
  onToggle,
  selectedDot,
  onSelectDot,
  accent,
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
        <div className="flex-1 min-w-0">
          <p className="font-display text-base text-ink">{section.title}</p>
          {section.description && (
            <p className="text-sm font-body text-ink-muted mt-0.5">{section.description}</p>
          )}
        </div>
        <span className="kq-chip bg-white/70 border-ink text-ink text-xs shrink-0">
          {section.passedCount} / {section.lessons.length}
        </span>
        <ChevronDown
          className="w-4 h-4 text-ink shrink-0 transition-transform duration-180"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="bg-paper p-4 border-t-[3px] border-inherit">
          <div className="flex flex-wrap gap-2">
            {section.lessons.map((lesson) => {
              const isSelected =
                selectedDot?.sectionId === section.id && selectedDot.lessonId === lesson.id

              let dotClass = 'w-3.5 h-3.5 rounded-full border-2 transition-all duration-100'
              if (lesson.locked) {
                dotClass += ' bg-paper-dark border-ink/30 cursor-not-allowed'
              } else if (lesson.passed) {
                dotClass += ` ${c.solid} ${c.border}`
              } else if (lesson.attempted) {
                dotClass += ' bg-sunny border-sunny'
              } else {
                dotClass += ' bg-paper border-ink'
              }

              if (isSelected) {
                dotClass += ' ring-2 ring-offset-1 ring-ink'
              }

              return (
                <button
                  key={lesson.id}
                  disabled={lesson.locked}
                  title={lesson.title}
                  aria-label={`${lesson.title}${lesson.passed ? ' (passed)' : lesson.attempted ? ' (in progress)' : lesson.locked ? ' (locked)' : ''}`}
                  onClick={() => !lesson.locked && onSelectDot(section.id, lesson.id)}
                  className={dotClass}
                />
              )
            })}
          </div>

          {selectedLesson && (
            <DetailPanel lesson={selectedLesson} accent={accent} />
          )}
        </div>
      )}
    </div>
  )
}

/** Lessons page — course switcher tabs + section accordions with lesson dot navigation. */
export function LessonsClient({ courses, activeCourseId, activeCourseAccent, sections, weakKeys }: Props) {
  const router = useRouter()

  const activeCourse = courses.find((c) => c.id === activeCourseId)

  const [openSectionId, setOpenSectionId] = useState<string | null>(() =>
    findAutoOpenSectionId(sections)
  )

  const [selectedDot, setSelectedDot] = useState<{ sectionId: string; lessonId: string } | null>(null)

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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Course switcher */}
      {courses.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Courses">
          {courses.map((course) => {
            const isActive = course.id === activeCourseId
            return (
              <button
                key={course.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  if (!isActive) router.push(`/lessons?course=${course.id}`)
                }}
                className={`kq-btn flex items-center gap-2 px-4 py-2 text-sm font-display shrink-0 ${
                  isActive ? `${accentBg(activeCourseAccent)} text-ink` : 'bg-paper-dark text-ink'
                }`}
              >
                <span aria-hidden="true">{course.icon}</span>
                {course.title}
              </button>
            )
          })}
        </div>
      )}

      {/* Course subtitle */}
      {activeCourse?.subtitle && (
        <p className="text-sm font-body text-ink-muted -mt-3">{activeCourse.subtitle}</p>
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
          />
        ))}
      </div>

      {/* Dot legend */}
      <div className="flex flex-wrap gap-4 pt-1" aria-label="Lesson status legend">
        {[
          { label: 'Passed',      bg: 'bg-mint',       border: 'border-mint' },
          { label: 'Up next',     bg: 'bg-paper',      border: 'border-ink' },
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
