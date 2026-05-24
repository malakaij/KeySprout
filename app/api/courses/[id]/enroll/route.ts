import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifySameOrigin } from '@/lib/csrf'

/** Enroll the current user in a course. Idempotent — safe to call if already enrolled. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: courseId } = await params

  const course = await prisma.course.findUnique({ where: { id: courseId, isPublic: true } })
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId: session.user.id, courseId } },
    create: { userId: session.user.id, courseId },
    update: {},
  })

  return NextResponse.json({ enrolled: true })
}
