import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { LessonClient } from './LessonClient'

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      section: {
        include: {
          course: {
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
          },
        },
      },
    },
  })
  if (!lesson) notFound()

  const currentSection = lesson.section
  const allSections = currentSection.course.sections
  const currentSectionLessons = allSections.find((s) => s.id === currentSection.id)?.lessons ?? []
  const currentLessonIndex = currentSectionLessons.findIndex((l) => l.id === lesson.id)

  let nextLesson: { id: string; title: string } | null = null
  if (currentLessonIndex < currentSectionLessons.length - 1) {
    nextLesson = currentSectionLessons[currentLessonIndex + 1]
  } else {
    const currentSectionIndex = allSections.findIndex((s) => s.id === currentSection.id)
    if (currentSectionIndex < allSections.length - 1) {
      const nextSection = allSections[currentSectionIndex + 1]
      if (nextSection.lessons.length > 0) {
        nextLesson = nextSection.lessons[0]
      }
    }
  }

  const userAttempts = await prisma.lessonAttempt.findMany({
    where: { userId: session.user.id, lessonId: id },
    orderBy: { completedAt: 'desc' },
  })

  const bestWpm = userAttempts.length > 0 ? Math.max(...userAttempts.map((a) => a.wpm)) : 0
  const passed = userAttempts.some((a) => {
    const wpmOk = !lesson.minWpm || a.wpm >= lesson.minWpm
    const accOk = !lesson.minAccuracy || a.accuracy >= lesson.minAccuracy
    return wpmOk && accOk
  })

  return (
    <LessonClient
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        sectionTitle: currentSection.title,
        courseTitle: currentSection.course.title,
        targetKeys: lesson.targetKeys,
        minWpm: lesson.minWpm,
        minAccuracy: lesson.minAccuracy,
        order: lesson.order,
      }}
      nextLesson={nextLesson}
      bestWpm={bestWpm}
      previouslyPassed={passed}
    />
  )
}
