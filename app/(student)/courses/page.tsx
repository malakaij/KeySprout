import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { CoursesClient } from './CoursesClient'

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { isPublic: true },
      orderBy: { order: 'asc' },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { lessons: { select: { id: true } } },
        },
      },
    }),
    prisma.courseEnrollment.findMany({
      where: { userId },
    }),
  ])

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId))
  const lastLessonMap = new Map(enrollments.map((e) => [e.courseId, e.lastLessonAt]))

  // Collect all lesson IDs across enrolled courses so we can count passes
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.has(c.id))
  const allLessonIds = enrolledCourses.flatMap((c) =>
    c.sections.flatMap((s) => s.lessons.map((l) => l.id)),
  )

  const attempts =
    allLessonIds.length > 0
      ? await prisma.lessonAttempt.findMany({
          where: { userId, lessonId: { in: allLessonIds } },
          select: { lessonId: true, wpm: true, accuracy: true },
        })
      : []

  // Build a set of passed lesson IDs (any attempt that meets the lesson's min thresholds)
  // For the courses page we just need a count; we treat any completed attempt as "started"
  const attemptedLessons = new Set(attempts.map((a) => a.lessonId))

  const courseData = courses.map((course) => {
    const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0)
    const startedLessons = course.sections
      .flatMap((s) => s.lessons)
      .filter((l) => attemptedLessons.has(l.id)).length
    const isEnrolled = enrolledCourseIds.has(course.id)
    const lastLessonAt = lastLessonMap.get(course.id) ?? null

    return {
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      icon: course.icon,
      accent: course.accent,
      totalLessons,
      startedLessons,
      isEnrolled,
      lastLessonAt: lastLessonAt?.toISOString() ?? null,
      enrolledAt:
        enrollments.find((e) => e.courseId === course.id)?.enrolledAt.toISOString() ?? null,
    }
  })

  return <CoursesClient courses={courseData} />
}
