import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifySameOrigin } from '@/lib/csrf'

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

  const [classroom, allPublicCourses] = await Promise.all([
    prisma.classroom.findUnique({
      where: { id: id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                nameChangeRequested: true,
                lessonAttempts: { orderBy: { completedAt: 'desc' }, take: 10 },
              },
            },
          },
        },
        courses: {
          include: { course: { select: { id: true, title: true, icon: true, accent: true } } },
          orderBy: { assignedAt: 'asc' },
        },
      },
    }),
    prisma.course.findMany({
      where: { isPublic: true },
      select: { id: true, title: true, icon: true, accent: true },
      orderBy: { order: 'asc' },
    }),
  ])

  if (!classroom) {
    return NextResponse.json({ error: 'Classroom not found' }, { status: 404 })
  }
  if (classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const approved = classroom.members
    .filter((m) => m.status === 'APPROVED')
    .map((member) => {
      const attempts = member.user.lessonAttempts
      const avgWpm = attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.wpm, 0) / attempts.length
        : 0
      return {
        id: member.id,
        userId: member.userId,
        joinedAt: member.joinedAt,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: null,
          image: null,
          nameChangeRequested: member.user.nameChangeRequested,
        },
        averageWpm: Math.round(avgWpm),
        lessonsCompleted: new Set(attempts.map((a) => a.lessonId)).size,
      }
    })

  const pending = classroom.members
    .filter((m) => m.status === 'PENDING')
    .map((member) => ({
      id: member.id,
      userId: member.userId,
      joinedAt: member.joinedAt,
      user: { id: member.user.id, name: member.user.name },
    }))

  const assignedCourseIds = new Set(classroom.courses.map((c) => c.courseId))
  const assignedCourses = classroom.courses.map((c) => ({
    id: c.id,
    courseId: c.courseId,
    title: c.course.title,
    icon: c.course.icon,
    accent: c.course.accent,
  }))
  const availableCourses = allPublicCourses.filter((c) => !assignedCourseIds.has(c.id))

  return NextResponse.json({
    ...classroom,
    members: approved,
    pendingMembers: pending,
    assignedCourses,
    availableCourses,
  })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const classroom = await prisma.classroom.findUnique({ where: { id: id } })
  if (!classroom) {
    return NextResponse.json({ error: 'Classroom not found' }, { status: 404 })
  }
  if (classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.classroom.delete({ where: { id: id } })
  return NextResponse.json({ success: true })
}
