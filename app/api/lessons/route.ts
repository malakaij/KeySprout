import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
    return NextResponse.json({ error: 'No course found' }, { status: 404 })
  }

  // Fetch all lesson attempts for this user
  const allLessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l.id))
  const attempts = await prisma.lessonAttempt.findMany({
    where: { userId: session.user.id, lessonId: { in: allLessonIds } },
  })

  const attemptMap = new Map<string, typeof attempts>()
  for (const attempt of attempts) {
    if (!attemptMap.has(attempt.lessonId)) {
      attemptMap.set(attempt.lessonId, [])
    }
    attemptMap.get(attempt.lessonId)!.push(attempt)
  }

  const sections = course.sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    order: section.order,
    lessons: section.lessons.map((lesson) => {
      const lessonAttempts = attemptMap.get(lesson.id) ?? []
      const bestWpm = lessonAttempts.length > 0 ? Math.max(...lessonAttempts.map((a) => a.wpm)) : null
      const bestAccuracy = lessonAttempts.length > 0 ? Math.max(...lessonAttempts.map((a) => a.accuracy)) : null
      const passed = lessonAttempts.some((a) => {
        const wpmOk = !lesson.minWpm || a.wpm >= lesson.minWpm
        const accOk = !lesson.minAccuracy || a.accuracy >= lesson.minAccuracy
        return wpmOk && accOk
      })
      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        type: lesson.type,
        sectionId: lesson.sectionId,
        targetKeys: lesson.targetKeys,
        minWpm: lesson.minWpm,
        targetWpm: lesson.targetWpm,
        minAccuracy: lesson.minAccuracy,
        attempts: lessonAttempts.length,
        bestWpm,
        bestAccuracy,
        passed,
      }
    }),
  }))

  return NextResponse.json({
    courseId: course.id,
    courseTitle: course.title,
    sections,
  })
}
