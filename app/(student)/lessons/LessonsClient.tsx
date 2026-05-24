'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { sectionColor } from '@/lib/section-colors'

export interface CourseTab {
  id: string
  title: string
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

/** Finds the index of the section that should auto-open on load. */
function findAutoOpenSectionId(sections: SectionData[]): string | null {
  for (const section of sections) {
    const firstUnstarted = section.lessons.find((l) => !l.locked && !l.attempted && !l.passed)
    if (firstUnstarted) return section.id
  }
  // Fall back to first section if everything is passed or no unlocked+unstarted found
  return sections[0]?.id ?? null
}

interface DetailPanelProps {
  lesson: LessonDot
  accent: string
}

function DetailPanel({ lesson, accent }: DetailPanelProps) {
  const preview = lesson.content ? lesson.content.slice(0, 120) : null
  const truncated = lesson.content && lesson.content.length > 120

  return (
    <div className="kq-card p-4 mt-2 space-y-3">
      <p className="font-display text-base text-ink">{lesson.title}</p>

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
      {/* Accordion header */}
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

      {/* Accordion body */}
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
export function LessonsClient({ courses, activeCourseId, activeCourseAccent, sections }: Props) {
  const router = useRouter()

  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const autoId = findAutoOpenSectionId(sections)
    return autoId ? new Set([autoId]) : new Set()
  })

  const [selectedDot, setSelectedDot] = useState<{ sectionId: string; lessonId: string } | null>(null)

  // Re-compute auto-open when sections change (course switch)
  useEffect(() => {
    const autoId = findAutoOpenSectionId(sections)
    setOpenSections(autoId ? new Set([autoId]) : new Set())
    setSelectedDot(null)
  }, [sections])

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
        // Clear dot selection if it was in the closing section
        if (selectedDot?.sectionId === sectionId) setSelectedDot(null)
      } else {
        next.add(sectionId)
      }
      return next
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

      {/* Section accordions */}
      <div className="space-y-3">
        {sections.map((section, sectionIndex) => (
          <SectionAccordion
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            selectedDot={selectedDot}
            onSelectDot={handleSelectDot}
            accent={activeCourseAccent}
          />
        ))}
      </div>
    </div>
  )
}
