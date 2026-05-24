import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { verifySameOrigin } from '@/lib/csrf'

const bodySchema = z.object({ courseId: z.string().min(1) })

/** Assign a course to a classroom and enroll all currently-approved members. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const classroom = await prisma.classroom.findUnique({ where: { id } })
  if (!classroom || classroom.teacherId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { courseId } = parsed.data

  const course = await prisma.course.findUnique({ where: { id: courseId, isPublic: true } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Assign course to classroom (idempotent)
  await prisma.classroomCourse.upsert({
    where: { classroomId_courseId: { classroomId: id, courseId } },
    create: { classroomId: id, courseId },
    update: {},
  })

  // Enroll all currently-approved members
  const members = await prisma.classMember.findMany({
    where: { classroomId: id, status: 'APPROVED' },
    select: { userId: true },
  })

  await prisma.$transaction(
    members.map((m) =>
      prisma.courseEnrollment.upsert({
        where: { userId_courseId: { userId: m.userId, courseId } },
        create: { userId: m.userId, courseId },
        update: {},
      })
    )
  )

  return NextResponse.json({ assigned: true, enrolledCount: members.length })
}
