import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({
  code: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { code } = parsed.data

  const classroom = await prisma.classroom.findUnique({ where: { code: code.toUpperCase() } })
  if (!classroom) {
    return NextResponse.json({ error: 'Classroom not found' }, { status: 404 })
  }

  const existing = await prisma.classMember.findUnique({
    where: {
      classroomId_userId: {
        classroomId: classroom.id,
        userId: session.user.id,
      },
    },
  })

  if (existing) {
    return NextResponse.json({ error: 'Already a member' }, { status: 409 })
  }

  const member = await prisma.classMember.create({
    data: {
      classroomId: classroom.id,
      userId: session.user.id,
    },
  })

  return NextResponse.json({ member, classroom })
}
