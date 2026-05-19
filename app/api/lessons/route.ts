import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lessons = await prisma.lesson.findMany({
    orderBy: { order: 'asc' },
  })

  const attempts = await prisma.lessonAttempt.findMany({
    where: { userId: session.user.id },
  })

  const lessonMap = new Map<string, typeof attempts>()
  for (const attempt of attempts) {
    if (!lessonMap.has(attempt.lessonId)) {
      lessonMap.set(attempt.lessonId, [])
    }
    lessonMap.get(attempt.lessonId)!.push(attempt)
  }

  const result = lessons.map((lesson) => {
    const lessonAttempts = lessonMap.get(lesson.id) ?? []
    const bestWpm = lessonAttempts.length > 0 ? Math.max(...lessonAttempts.map((a) => a.wpm)) : null
    const bestAccuracy = lessonAttempts.length > 0 ? Math.max(...lessonAttempts.map((a) => a.accuracy)) : null
    const passed = lessonAttempts.some((a) => {
      const wpmOk = !lesson.minWpm || a.wpm >= lesson.minWpm
      const accOk = !lesson.minAccuracy || a.accuracy >= lesson.minAccuracy
      return wpmOk && accOk
    })

    return {
      ...lesson,
      attempts: lessonAttempts.length,
      bestWpm,
      bestAccuracy,
      passed,
    }
  })

  return NextResponse.json(result)
}
