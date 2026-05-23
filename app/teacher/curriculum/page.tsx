import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { BookOpen, Layers, Zap } from 'lucide-react'
import { sectionColor } from '@/lib/section-colors'

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Beginner', color: 'bg-mint/30 text-ink border-mint' },
  1: { label: 'Easy', color: 'bg-sky/30 text-ink border-sky' },
  2: { label: 'Medium', color: 'bg-sunny/30 text-ink border-sunny' },
  3: { label: 'Hard', color: 'bg-coral/30 text-ink border-coral' },
  4: { label: 'Expert', color: 'bg-grape/30 text-white border-grape' },
}

export default async function CurriculumPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const courses = await prisma.course.findMany({
    include: {
      sections: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, title: true, minWpm: true, minAccuracy: true, type: true },
          },
          _count: { select: { lessons: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display text-ink">Curriculum</h1>
        <p className="text-ink-muted mt-1 font-body">Browse all courses, sections, and lessons in the typing curriculum.</p>
      </div>

      {courses.length === 0 ? (
        <div className="kq-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-ink/20 mx-auto mb-4" />
          <p className="text-ink-muted font-body">No curriculum seeded yet.</p>
          <p className="text-sm text-ink-muted font-body mt-1">Go to the admin panel to seed the database.</p>
        </div>
      ) : (
        courses.map((course) => (
          <div key={course.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink border-[3px] border-ink flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-paper" />
              </div>
              <div>
                <h2 className="text-xl font-display text-ink">{course.title}</h2>
                {course.description && (
                  <p className="text-sm text-ink-muted font-body">{course.description}</p>
                )}
              </div>
              <span className="ml-auto text-xs text-ink-muted font-body">
                {course.sections.length} sections · {course.sections.reduce((s, sec) => s + sec._count.lessons, 0)} lessons
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {course.sections.map((section, si) => {
                const color = sectionColor(si)
                const difficultyIndex = Math.min(si, 4)
                const diff = DIFFICULTY_LABELS[difficultyIndex]
                const avgWpm = section.lessons
                  .filter((l) => l.minWpm)
                  .reduce((s, l) => s + (l.minWpm ?? 0), 0) /
                  Math.max(section.lessons.filter((l) => l.minWpm).length, 1)

                return (
                  <div key={section.id} className={`kq-card p-4 ${color.bg} border-[3px] ${color.border} space-y-3`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-ink-muted shrink-0" />
                        <h3 className="font-display text-ink text-sm leading-tight">{section.title}</h3>
                      </div>
                      <span className={`kq-chip text-xs shrink-0 ${diff.color} border-2`}>
                        {diff.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-ink-muted font-body">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {section._count.lessons} lessons
                      </span>
                      {avgWpm > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {Math.round(avgWpm)} WPM target
                        </span>
                      )}
                    </div>

                    {/* Lesson dots preview */}
                    <div className="flex flex-wrap gap-1">
                      {section.lessons.slice(0, 20).map((_, li) => (
                        <div
                          key={li}
                          className={`w-2 h-2 rounded-full ${color.solid} border border-ink/20`}
                        />
                      ))}
                      {section.lessons.length > 20 && (
                        <span className="text-xs text-ink-muted font-body">+{section.lessons.length - 20}</span>
                      )}
                    </div>

                    <div className="text-xs text-ink-muted font-body border-t border-ink/10 pt-2">
                      {section.lessons[0]?.title && (
                        <p className="truncate">First: {section.lessons[0].title}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
