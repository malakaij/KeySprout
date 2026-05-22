import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({
  action: z.enum(['approve', 'reject']),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const classroom = await prisma.classroom.findUnique({ where: { id: id } })
  if (!classroom || classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const member = await prisma.classMember.findUnique({
    where: { id: memberId },
  })
  if (!member || member.classroomId !== id) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  if (parsed.data.action === 'approve') {
    const updated = await prisma.classMember.update({
      where: { id: memberId },
      data: { status: 'APPROVED' },
    })
    return NextResponse.json({ member: updated })
  } else {
    await prisma.classMember.delete({ where: { id: memberId } })
    return NextResponse.json({ success: true })
  }
}
