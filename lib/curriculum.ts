import { prisma } from '@/lib/db'

export interface Unit {
  name: string
  description: string
  color: string
  lessonOrders: number[]
}

export const UNITS: Unit[] = [
  {
    name: 'Home Row',
    description: 'Master the foundation — the home row keys a, s, d, f, j, k, l, and semicolon.',
    color: 'emerald',
    lessonOrders: [1, 2, 3, 4, 5, 6],
  },
  {
    name: 'Top Row',
    description: 'Reach up to the top row: q, w, e, r, t, y, u, i, o, p.',
    color: 'blue',
    lessonOrders: [7, 8, 9, 10, 11, 12, 13],
  },
  {
    name: 'Bottom Row',
    description: 'Reach down to the bottom row: z, x, c, v, b, n, m, and punctuation.',
    color: 'purple',
    lessonOrders: [14, 15, 16, 17, 18, 19],
  },
  {
    name: 'Common Words',
    description: 'Build fluency with the most frequently used English words and sentences.',
    color: 'amber',
    lessonOrders: [20, 21, 22, 23, 24, 25],
  },
  {
    name: 'Speed Building',
    description: 'Push your speed with longer natural English passages from classic literature.',
    color: 'red',
    lessonOrders: [26, 27, 28, 29, 30],
  },
]

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
