import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ProgressClient } from './ProgressClient'
import { analyzeWeakKeys } from '@/lib/typing-engine'
import { UNITS } from '@/lib/curriculum'

export default async function ProgressPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [attempts, lessons] = await Promise.all([
    prisma.lessonAttempt.findMany({
      where: { userId },
      include: { lesson: true },
      orderBy: { completedAt: 'asc' },
    }),
    prisma.lesson.findMany({ orderBy: { order: 'asc' } }),
  ])

  const chartData = attempts.map((a) => ({
    date: a.completedAt.toISOString(),
    wpm: a.wpm,
    accuracy: a.accuracy,
  }))

  const unitStats = UNITS.map((unit) => {
    const unitLessons = lessons.filter((l) => l.unit === unit.name)
    const passedCount = unitLessons.filter((l) => {
      return attempts.some((a) => {
        if (a.lessonId !== l.id) return false
        const wpmOk = !l.minWpm || a.wpm >= l.minWpm
        const accOk = !l.minAccuracy || a.accuracy >= l.minAccuracy
        return wpmOk && accOk
      })
    }).length
    return { name: unit.name, total: unitLessons.length, passed: passedCount, color: unit.color }
  })

  // Aggregate weak keys from all attempts
  const keyErrorMap: Record<string, number[]> = {}
  for (const attempt of attempts) {
    if (attempt.lesson) {
      const errors = analyzeWeakKeys(attempt.lesson.content, attempt.lesson.content.slice(0, Math.floor(attempt.lesson.content.length * attempt.accuracy)))
      for (const [key, rate] of Object.entries(errors)) {
        if (!keyErrorMap[key]) keyErrorMap[key] = []
        keyErrorMap[key].push(rate)
      }
    }
  }

  const weakKeys: Record<string, number> = {}
  for (const [key, rates] of Object.entries(keyErrorMap)) {
    weakKeys[key] = rates.reduce((s, r) => s + r, 0) / rates.length
  }

  const recentAttempts = attempts
    .slice(-20)
    .reverse()
    .map((a) => ({
      id: a.id,
      lessonTitle: a.lesson?.title ?? 'Unknown',
      wpm: a.wpm,
      accuracy: a.accuracy,
      errors: a.errors,
      completedAt: a.completedAt.toISOString(),
    }))

  return (
    <ProgressClient
      chartData={chartData}
      unitStats={unitStats}
      weakKeys={weakKeys}
      recentAttempts={recentAttempts}
    />
  )
}
