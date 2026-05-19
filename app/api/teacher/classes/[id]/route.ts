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
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const classroom = await prisma.classroom.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: {
          user: {
            include: {
              lessonAttempts: {
                orderBy: { completedAt: 'desc' },
                take: 10,
              },
            },
          },
        },
      },
    },
  })

  if (!classroom) {
    return NextResponse.json({ error: 'Classroom not found' }, { status: 404 })
  }

  if (classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const membersWithStats = classroom.members.map((member) => {
    const attempts = member.user.lessonAttempts
    const avgWpm = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + a.wpm, 0) / attempts.length
      : 0
    const uniqueLessons = new Set(attempts.map((a) => a.lessonId)).size

    return {
      id: member.id,
      userId: member.userId,
      joinedAt: member.joinedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
      },
      averageWpm: Math.round(avgWpm),
      lessonsCompleted: uniqueLessons,
    }
  })

  return NextResponse.json({
    ...classroom,
    members: membersWithStats,
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const classroom = await prisma.classroom.findUnique({ where: { id: params.id } })
  if (!classroom) {
    return NextResponse.json({ error: 'Classroom not found' }, { status: 404 })
  }
  if (classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.classroom.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
