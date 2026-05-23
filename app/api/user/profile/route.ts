import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { verifySameOrigin } from '@/lib/csrf'

const bodySchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER']),
  accessCode: z.string().optional(),
})

export async function PATCH(req: Request) {
  const csrfError = verifySameOrigin(req)
  if (csrfError) return csrfError

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { role, accessCode } = parsed.data

  if (role === 'TEACHER') {
    const expected = process.env.TEACHER_ACCESS_CODE
    if (!expected || accessCode !== expected) {
      return NextResponse.json({ error: 'Invalid access code' }, { status: 403 })
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { role },
  })

  return NextResponse.json({ user })
}
