import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifySameOrigin } from '@/lib/csrf'

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generatePassword(): string {
  const buf = new Uint8Array(8)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join('')
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

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

  // Confirm the student is a member of this class
  const membership = await prisma.classMember.findUnique({
    where: { classroomId_userId: { classroomId, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'Student not in class' }, { status: 404 })

  const password = generatePassword()
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  return NextResponse.json({ password })
}
