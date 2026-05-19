import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({
  wpm: z.number().nonnegative(),
  accuracy: z.number().min(0).max(1),
  duration: z.number().nonnegative(),
  errors: z.number().nonnegative(),
})

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { wpm, accuracy, duration, errors } = parsed.data

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } })
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const attempt = await prisma.lessonAttempt.create({
    data: {
      userId: session.user.id,
      lessonId: params.id,
      wpm,
      accuracy,
      duration,
      errors,
    },
  })

  const nextLesson = await prisma.lesson.findFirst({
    where: { order: lesson.order + 1 },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ attempt, nextLesson })
}
