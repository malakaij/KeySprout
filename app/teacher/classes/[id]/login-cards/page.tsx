import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { LoginCardsClient } from './LoginCardsClient'

export interface StudentRecord {
  userId: string
  name: string
}

export default async function LoginCardsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: classroomId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') redirect('/')

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    select: {
      name: true,
      teacherId: true,
      members: {
        where: { status: 'APPROVED' },
        select: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })

  if (!classroom || classroom.teacherId !== session.user.id) return notFound()

  const students: StudentRecord[] = classroom.members.map(({ user }) => ({
    userId: user.id,
    name: user.name ?? 'Student',
  }))

  return (
    <LoginCardsClient
      classroomId={classroomId}
      classroomName={classroom.name}
      students={students}
      baseUrl={process.env.NEXTAUTH_URL ?? ''}
    />
  )
}
