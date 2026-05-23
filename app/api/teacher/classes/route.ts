import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { verifySameOrigin } from '@/lib/csrf'

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const classes = await prisma.classroom.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(classes)
}

export async function POST(req: Request) {
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { name, description } = parsed.data
  const code = nanoid(6).toUpperCase()

  const classroom = await prisma.classroom.create({
    data: {
      name,
      description,
      code,
      teacherId: session.user.id,
    },
  })

  return NextResponse.json(classroom, { status: 201 })
}
