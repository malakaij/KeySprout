import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: {
      section: {
        include: {
          course: {
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
  }

  const attempts = await prisma.lessonAttempt.findMany({
    where: { userId: session.user.id, lessonId: params.id },
    orderBy: { completedAt: 'desc' },
  })

  return NextResponse.json({ lesson, attempts })
}
