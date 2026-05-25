import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decryptPassword } from '@/lib/password-crypto'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id: classroomId, userId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    select: { teacherId: true },
  })
  if (!classroom || classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const membership = await prisma.classMember.findUnique({
    where: { classroomId_userId: { classroomId, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'Student not in class' }, { status: 404 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { encryptedPassword: true },
  })

  if (!user?.encryptedPassword) {
    return NextResponse.json({ error: 'no_key' }, { status: 404 })
  }

  const password = decryptPassword(user.encryptedPassword)
  if (!password) {
    return NextResponse.json({ error: 'no_key' }, { status: 503 })
  }

  return NextResponse.json({ password })
}
