'use client'

import Link from 'next/link'

const ACCENT_COLOR: Record<string, string> = {
  mint:  'var(--color-mint)',
  sky:   'var(--color-sky)',
  sunny: 'var(--color-sunny)',
  grape: 'var(--color-grape)',
  coral: 'var(--color-coral)',
  berry: 'var(--color-berry)',
}

/** Accents that need white text for sufficient contrast. */
const ACCENT_DARK = new Set(['grape', 'coral', 'berry'])

interface UpNextCardProps {
  courseTitle: string
  courseIcon: string
  courseAccent: string
  sectionTitle: string
  lessonTitle: string
  lessonId: string
  /** 1-based display order number for the lesson. */
  lessonOrder: number
  minWpm?: number | null
  minAccuracy?: number | null
}

/** Shared "Up Next" card used on the dashboard and lessons pages. */
export function UpNextCard({
  courseTitle,
  courseIcon,
  courseAccent,
  sectionTitle,
  lessonTitle,
  lessonId,
  lessonOrder,
  minWpm,
  minAccuracy,
}: UpNextCardProps) {
  const accentVar = ACCENT_COLOR[courseAccent] ?? ACCENT_COLOR.mint
  const isDark = ACCENT_DARK.has(courseAccent)
  const btnTextColor = isDark ? '#fff' : '#1a1a2e'

  const hasGoal = minWpm || minAccuracy

  return (
    <div
      className="kq-card p-5 flex items-center gap-4"
      style={{
        background: `linear-gradient(135deg, ${accentVar}26, rgba(255,255,255,0.4))`,
        boxShadow: '4px 4px 0 #1a1a2e',
      }}
    >
      {/* Course icon circle */}
      <div
        className="shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          background: accentVar,
          border: '3px solid #1a1a2e',
          boxShadow: '3px 3px 0 #1a1a2e',
          fontSize: 28,
        }}
        aria-hidden="true"
      >
        {courseIcon}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p
          className="font-display uppercase text-ink-muted"
          style={{ fontSize: 11 }}
        >
          UP NEXT · {courseTitle} · {sectionTitle} · LESSON {lessonOrder}
        </p>
        <h2 className="font-display text-ink" style={{ fontSize: 20 }}>
          {lessonTitle}
        </h2>

        {hasGoal && (
          <div className="flex items-center gap-2 mt-1">
            {minWpm && (
              <span
                className="text-ink font-body"
                style={{
                  background: 'var(--color-mint)',
                  border: '1px solid #1a1a2e',
                  borderRadius: 999,
                  padding: '1px 8px',
                  fontSize: 11,
                }}
              >
                Goal: {minWpm} WPM
              </span>
            )}
            {minAccuracy && (
              <span
                className="text-ink font-body"
                style={{
                  background: 'var(--color-sky)',
                  border: '1px solid #1a1a2e',
                  borderRadius: 999,
                  padding: '1px 8px',
                  fontSize: 11,
                }}
              >
                {Math.round(minAccuracy * 100)}% acc
              </span>
            )}
          </div>
        )}
      </div>

      {/* CTA button */}
      <Link
        href={`/lessons/${lessonId}`}
        className="shrink-0 kq-btn font-display"
        style={{
          background: accentVar,
          color: btnTextColor,
        }}
      >
        Continue
      </Link>
    </div>
  )
}
