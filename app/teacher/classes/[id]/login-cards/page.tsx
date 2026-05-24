import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createHash } from 'crypto'
import qrcode from 'qrcode'
import { PrintButton } from './PrintButton'

/** 30-day token TTL — matches the login-token API route. */
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000

interface Student {
  userId: string
  name: string
  qrSvg: string
  token: string
}

async function generateStudentCards(
  classroomId: string,
  teacherId: string,
): Promise<{ classroomName: string; students: Student[] }> {
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

  if (!classroom || classroom.teacherId !== teacherId) return notFound()

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://keysprout.app'

  const students: Student[] = await Promise.all(
    classroom.members.map(async ({ user }) => {
      // Generate a fresh single-use QR login token
      const buf = new Uint8Array(32)
      crypto.getRandomValues(buf)
      const token = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
      const tokenHash = createHash('sha256').update(token).digest('hex')

      await prisma.studentLoginToken.create({
        data: {
          userId: user.id,
          classroomId,
          tokenHash,
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      })

      const loginUrl = `${baseUrl}/login/token?t=${token}`
      const qrSvg = await qrcode.toString(loginUrl, {
        type: 'svg',
        width: 160,
        margin: 1,
        color: { dark: '#1a1a2e', light: '#fef9ef' },
      })

      return { userId: user.id, name: user.name ?? 'Student', qrSvg, token }
    })
  )

  return { classroomName: classroom.name, students }
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

  const { classroomName, students } = await generateStudentCards(classroomId, session.user.id)

  return (
    <div className="bg-paper min-h-screen">
      {/* Screen-only header */}
      <div className="print:hidden p-6 flex items-center justify-between border-b-2 border-ink/10">
        <div>
          <h1 className="text-2xl font-display text-ink">Login Cards — {classroomName}</h1>
          <p className="text-ink-muted font-body text-sm mt-1">
            Print and cut these cards. Each student gets one card. QR codes expire in 30 days.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Card grid */}
      <div className="p-6 grid grid-cols-2 gap-6 print:p-0 print:gap-0 print:grid-cols-2">
        {students.map((s) => (
          <div
            key={s.userId}
            className="border-2 border-ink rounded-2xl p-5 flex gap-4 items-start bg-paper print:rounded-none print:border print:border-ink/30 print:break-inside-avoid"
          >
            {/* QR code */}
            <div
              className="shrink-0 rounded-xl overflow-hidden border-2 border-ink/20"
              dangerouslySetInnerHTML={{ __html: s.qrSvg }}
              style={{ width: 100, height: 100 }}
              aria-label={`QR code for ${s.name}`}
            />
            <div className="min-w-0">
              <p className="text-xs text-ink-muted font-body uppercase tracking-wider mb-1">
                {classroomName}
              </p>
              <p className="text-xl font-display text-ink leading-tight">{s.name}</p>
              <p className="text-xs font-body text-ink-muted mt-2 leading-relaxed">
                Scan to sign in, or go to
              </p>
              <p className="text-xs font-mono text-ink break-all">
                {process.env.NEXTAUTH_URL ?? 'keysprout.app'}/login
              </p>
              <p className="text-xs font-body text-ink-muted mt-2">
                Username: <span className="font-semibold text-ink">{s.name}</span>
              </p>
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <p className="col-span-2 text-center text-ink-muted font-body py-12">
            No approved students in this class yet.
          </p>
        )}
      </div>

      <p className="print:hidden text-center text-xs text-ink-muted font-body pb-6">
        Cards contain single-use QR tokens. Regenerate this page to issue fresh tokens.
      </p>
    </div>
  )
}
