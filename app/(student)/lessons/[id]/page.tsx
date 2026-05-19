import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { LessonClient } from './LessonClient'

export default async function LessonPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } })
  if (!lesson) notFound()

  const nextLesson = await prisma.lesson.findFirst({
    where: { order: lesson.order + 1 },
    orderBy: { order: 'asc' },
  })

  const userAttempts = await prisma.lessonAttempt.findMany({
    where: { userId: session.user.id, lessonId: lesson.id },
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
      lesson={lesson}
      nextLesson={nextLesson}
      bestWpm={bestWpm}
      previouslyPassed={passed}
    />
  )
}
