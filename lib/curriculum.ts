import { prisma } from '@/lib/db'

export async function getLessonProgress(userId: string, lessonId: string) {
  const attempts = await prisma.lessonAttempt.findMany({
    where: { userId, lessonId },
    orderBy: { completedAt: 'desc' },
  })

  if (attempts.length === 0) {
    return { attempts: 0, bestWpm: null, bestAccuracy: null, passed: false }
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { minWpm: true, minAccuracy: true },
  })

  const bestWpm = Math.max(...attempts.map((a) => a.wpm))
  const bestAccuracy = Math.max(...attempts.map((a) => a.accuracy))

  const passed = attempts.some((a) => {
    const wpmOk = !lesson?.minWpm || a.wpm >= lesson.minWpm
    const accOk = !lesson?.minAccuracy || a.accuracy >= lesson.minAccuracy
    return wpmOk && accOk
  })

  return { attempts: attempts.length, bestWpm, bestAccuracy, passed }
}

export async function getFirstCourse() {
  return prisma.course.findFirst({
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
}
