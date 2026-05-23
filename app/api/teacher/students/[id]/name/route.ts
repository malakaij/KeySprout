import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { verifySameOrigin } from '@/lib/csrf'

const bodySchema = z.object({
  name: z.string().min(1).max(60),
})

export async function PATCH(
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

  // Verify the student is in one of this teacher's classes.
  const membership = await prisma.classMember.findFirst({
    where: {
      userId: id,
      status: 'APPROVED',
      classroom: { teacherId: session.user.id },
    },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Student not in your class' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: id },
    data: { name: parsed.data.name, nameChangeRequested: false },
    select: { id: true, name: true },
  })

  return NextResponse.json({ user: updated })
}
