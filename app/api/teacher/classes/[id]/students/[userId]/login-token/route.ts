import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createHash } from 'crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { verifySameOrigin } from '@/lib/csrf'

/** 1-year expiry — QR cards are a primary login method, valid for the full school year. */
const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000

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

  const membership = await prisma.classMember.findUnique({
    where: { classroomId_userId: { classroomId, userId } },
  })
  if (!membership) return NextResponse.json({ error: 'Student not in class' }, { status: 404 })

  // Generate a 32-byte random token and store its SHA-256 hash
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  const token = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
  const tokenHash = createHash('sha256').update(token).digest('hex')

  await prisma.studentLoginToken.create({
    data: {
      userId,
      classroomId,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  })

  return NextResponse.json({ token })
}
