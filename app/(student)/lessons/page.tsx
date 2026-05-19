import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { LessonsClient } from './LessonsClient'

export default async function LessonsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [lessons, attempts] = await Promise.all([
    prisma.lesson.findMany({ orderBy: { order: 'asc' } }),
    prisma.lessonAttempt.findMany({ where: { userId } }),
  ])

  const attemptMap = new Map<string, typeof attempts>()
  for (const a of attempts) {
    if (!attemptMap.has(a.lessonId)) attemptMap.set(a.lessonId, [])
    attemptMap.get(a.lessonId)!.push(a)
  }

  const lessonsWithProgress = lessons.map((lesson) => {
    const la = attemptMap.get(lesson.id) ?? []
    const bestWpm = la.length > 0 ? Math.max(...la.map((a) => a.wpm)) : null
    const bestAccuracy = la.length > 0 ? Math.max(...la.map((a) => a.accuracy)) : null
    const passed = la.some((a) => {
      const wpmOk = !lesson.minWpm || a.wpm >= lesson.minWpm
      const accOk = !lesson.minAccuracy || a.accuracy >= lesson.minAccuracy
      return wpmOk && accOk
    })
    return { ...lesson, attempts: la.length, bestWpm, bestAccuracy, passed }
  })

  return <LessonsClient lessons={lessonsWithProgress} />
}
