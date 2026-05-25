import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    select: {
      teacherId: true,
      members: {
        where: { status: 'APPROVED' },
        select: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })
  if (!classroom) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const lines = [
    'keysprout_uuid,nickname,display_name',
    ...classroom.members.map(
      (m) => `${m.user.id},${JSON.stringify(m.user.name ?? '')},`
    ),
  ]
  const csv = lines.join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="roster-${classroomId}.csv"`,
    },
  })
}
