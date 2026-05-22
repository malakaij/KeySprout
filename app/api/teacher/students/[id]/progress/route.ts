import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { analyzeWeakKeys } from '@/lib/typing-engine'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const student = await prisma.user.findUnique({
    where: { id: id },
    include: {
      lessonAttempts: {
        include: { lesson: { include: { section: true } } },
        orderBy: { completedAt: 'asc' },
      },
    },
  })

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  const attemptsByLesson = new Map<string, typeof student.lessonAttempts>()
  for (const attempt of student.lessonAttempts) {
    if (!attemptsByLesson.has(attempt.lessonId)) {
      attemptsByLesson.set(attempt.lessonId, [])
    }
    attemptsByLesson.get(attempt.lessonId)!.push(attempt)
  }

  const lessonStats = Array.from(attemptsByLesson.entries()).map(([lessonId, attempts]) => {
    const lesson = attempts[0].lesson
    const bestWpm = Math.max(...attempts.map((a) => a.wpm))
    const bestAccuracy = Math.max(...attempts.map((a) => a.accuracy))
    const passed = attempts.some((a) => {
      const wpmOk = !lesson.minWpm || a.wpm >= lesson.minWpm
      const accOk = !lesson.minAccuracy || a.accuracy >= lesson.minAccuracy
      return wpmOk && accOk
    })

    return {
      lessonId,
      title: lesson.title,
      unit: lesson.section.title,
      attemptsCount: attempts.length,
      bestWpm,
      bestAccuracy,
      passed,
    }
  })

  const chartData = student.lessonAttempts.map((a) => ({
    date: a.completedAt.toISOString(),
    wpm: a.wpm,
    accuracy: Math.round(a.accuracy * 100),
  }))

  const allErrors: Record<string, number> = {}
  const allTotal: Record<string, number> = {}

  for (const attempt of student.lessonAttempts) {
    const errors = analyzeWeakKeys(attempt.lesson.content ?? '', '')
    for (const [key, rate] of Object.entries(errors)) {
      if (!allErrors[key]) allErrors[key] = 0
      if (!allTotal[key]) allTotal[key] = 0
      allErrors[key] += rate
      allTotal[key]++
    }
  }

  const weakKeys: Record<string, number> = {}
  for (const key of Object.keys(allTotal)) {
    weakKeys[key] = allErrors[key] / allTotal[key]
  }

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name,
      email: student.email,
      image: student.image,
      createdAt: student.createdAt,
    },
    lessonStats,
    chartData,
    weakKeys,
    totalAttempts: student.lessonAttempts.length,
  })
}
