import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifySameOrigin } from '@/lib/csrf'

/** Unassign a course from a classroom. Does not revoke existing student enrollments. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; courseId: string }> }
) {
  const { id, courseId } = await params
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const classroom = await prisma.classroom.findUnique({ where: { id } })
  if (!classroom || classroom.teacherId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.classroomCourse.deleteMany({ where: { classroomId: id, courseId } })

  return NextResponse.json({ unassigned: true })
}
