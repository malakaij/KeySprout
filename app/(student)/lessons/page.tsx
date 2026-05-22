import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { LessonsClient } from './LessonsClient'

export default async function LessonsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const course = await prisma.course.findFirst({
    where: { isPublic: true },
    orderBy: { order: 'asc' },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-display text-ink">No courses available yet.</h1>
      </div>
    )
  }

  const allLessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id))
  const attempts = await prisma.lessonAttempt.findMany({
    where: { userId, lessonId: { in: allLessonIds } },
  })

  const attemptMap = new Map<string, typeof attempts>()
  for (const a of attempts) {
    if (!attemptMap.has(a.lessonId)) attemptMap.set(a.lessonId, [])
    attemptMap.get(a.lessonId)!.push(a)
  }

  const sections = course.sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    order: section.order,
    lessons: section.lessons.map((lesson) => {
      const la = attemptMap.get(lesson.id) ?? []
      const bestWpm = la.length > 0 ? Math.max(...la.map((a) => a.wpm)) : null
      const bestAccuracy = la.length > 0 ? Math.max(...la.map((a) => a.accuracy)) : null
      const passed = la.some((a) => {
        const wpmOk = !lesson.minWpm || a.wpm >= lesson.minWpm
        const accOk = !lesson.minAccuracy || a.accuracy >= lesson.minAccuracy
        return wpmOk && accOk
      })
      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        order: lesson.order,
        type: lesson.type as 'SCRIPTED' | 'DYNAMIC',
        sectionId: lesson.sectionId,
        targetKeys: lesson.targetKeys,
        minWpm: lesson.minWpm,
        targetWpm: lesson.targetWpm,
        minAccuracy: lesson.minAccuracy,
        attempts: la.length,
        bestWpm,
        bestAccuracy,
        passed,
      }
    }),
  }))

  return <LessonsClient courseTitle={course.title} sections={sections} />
}
