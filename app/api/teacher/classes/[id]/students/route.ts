import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateRandomDisplayName } from '@/lib/name-generator'
import { verifySameOrigin } from '@/lib/csrf'

// Unambiguous characters: no 0/O or 1/l/I
const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Generates a random 8-character password using only unambiguous characters. */
function generatePassword(): string {
  const buf = new Uint8Array(8)
  crypto.getRandomValues(buf)
  return Array.from(buf, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join('')
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const { id: classroomId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true, teacherId: true },
  })
  if (!classroom) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as { count?: unknown }
  const count = typeof body.count === 'number' && body.count > 0 && body.count <= 50
    ? Math.floor(body.count)
    : 1

  const created: Array<{ userId: string; name: string; password: string }> = []

  for (let i = 0; i < count; i++) {
    const password = generatePassword()
    const passwordHash = await bcrypt.hash(password, 12)
    const name = generateRandomDisplayName()
    // Unique synthetic email derived from cuid at creation time
    const tempId = crypto.randomUUID()
    const email = `${tempId}@keysprout.invalid`

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'STUDENT',
        classMembers: {
          create: {
            classroomId,
            status: 'APPROVED',
          },
        },
      },
      select: { id: true, name: true },
    })

    created.push({ userId: user.id, name: user.name ?? name, password })
  }

  return NextResponse.json({ created })
}
