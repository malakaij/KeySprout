import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { LessonsClient } from './LessonsClient'
import type { CourseTab, SectionData, LessonDot } from './LessonsClient'

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const { course: courseParam } = await searchParams

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    orderBy: [{ lastLessonAt: { sort: 'desc', nulls: 'last' } }],
    include: {
      course: {
        select: { id: true, title: true, icon: true, accent: true, order: true },
      },
    },
  })

  // Auto-enroll in the first public course so /lessons always works without
  // requiring a prior visit to /courses.
  if (enrollments.length === 0) {
    const firstCourse = await prisma.course.findFirst({
      where: { isPublic: true },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, icon: true, accent: true, order: true },
    })
    if (!firstCourse) redirect('/courses')
    await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId: firstCourse.id } },
      create: { userId, courseId: firstCourse.id },
      update: {},
    })
    enrollments.push({
      id: '',
      userId,
      courseId: firstCourse.id,
      enrolledAt: new Date(),
      lastLessonAt: null,
      course: firstCourse,
    })
  }

  const courses: CourseTab[] = enrollments.map((e) => ({
    id: e.course.id,
    title: e.course.title,
    icon: e.course.icon,
    accent: e.course.accent,
  }))

  const enrolledIds = new Set(courses.map((c) => c.id))
  const activeCourseId =
    courseParam && enrolledIds.has(courseParam) ? courseParam : courses[0].id
  const activeCourse = courses.find((c) => c.id === activeCourseId)!

  const courseWithSections = await prisma.course.findUnique({
    where: { id: activeCourseId },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } },
        },
      },
    },
  })

  if (!courseWithSections) redirect('/courses')

  const allLessonIds = courseWithSections.sections.flatMap((s) =>
    s.lessons.map((l) => l.id),
  )

  const attempts = await prisma.lessonAttempt.findMany({
    where: { userId, lessonId: { in: allLessonIds } },
  })

  const attemptMap = new Map<string, typeof attempts>()
  for (const a of attempts) {
    if (!attemptMap.has(a.lessonId)) attemptMap.set(a.lessonId, [])
    attemptMap.get(a.lessonId)!.push(a)
  }

  // Build a flat ordered list of all lessons to compute locking
  const allLessonsFlat = courseWithSections.sections.flatMap((s) => s.lessons)
  const passedIds = new Set<string>()

  for (const lesson of allLessonsFlat) {
    const la = attemptMap.get(lesson.id) ?? []
    const passed = la.some((a) => {
      const wpmOk = !lesson.minWpm || a.wpm >= lesson.minWpm
      const accOk = !lesson.minAccuracy || a.accuracy >= lesson.minAccuracy
      return wpmOk && accOk
    })
    if (passed) passedIds.add(lesson.id)
  }

  const sections: SectionData[] = courseWithSections.sections.map((section, sectionIndex) => {
    const lessons: LessonDot[] = section.lessons.map((lesson, lessonIndex) => {
      const la = attemptMap.get(lesson.id) ?? []
      const passed = passedIds.has(lesson.id)
      const attempted = la.length > 0
      const bestWpm = la.length > 0 ? Math.max(...la.map((a) => a.wpm)) : null
      const bestAccuracy = la.length > 0 ? Math.max(...la.map((a) => a.accuracy)) : null

      let locked: boolean
      if (sectionIndex === 0 && lessonIndex === 0) {
        locked = false
      } else if (lessonIndex > 0) {
        locked = !passedIds.has(section.lessons[lessonIndex - 1].id)
      } else {
        const prevSection = courseWithSections.sections[sectionIndex - 1]
        locked = !passedIds.has(prevSection.lessons[prevSection.lessons.length - 1].id)
      }

      return {
        id: lesson.id,
        order: lesson.order,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        passed,
        attempted,
        locked,
        bestWpm,
        bestAccuracy,
        minWpm: lesson.minWpm,
        targetWpm: lesson.targetWpm,
      }
    })

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      order: section.order,
      lessons,
      passedCount: lessons.filter((l) => l.passed).length,
    }
  })

  return (
    <LessonsClient
      courses={courses}
      activeCourseId={activeCourseId}
      activeCourseAccent={activeCourse.accent}
      sections={sections}
    />
  )
}
