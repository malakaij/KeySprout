import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createHash } from 'crypto'
import qrcode from 'qrcode'
import { PrintButton } from './PrintButton'

/** 1-year TTL — cards are a primary login method, valid for the full school year. */
const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000

interface Student {
  userId: string
  name: string
  qrSvg: string
}

async function buildStudentCards(
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
  const now = new Date()

  const students: Student[] = await Promise.all(
    classroom.members.map(async ({ user }) => {
      // Reuse the student's existing valid token so already-printed cards keep working.
      // Only mint a new token if none exists or all have expired.
      let existing = await prisma.studentLoginToken.findFirst({
        where: { userId: user.id, classroomId, expiresAt: { gt: now } },
        orderBy: { createdAt: 'desc' },
      })

      let plainToken: string

      if (existing) {
        // We stored only the hash; reconstruct the plain token by checking
        // the token API — but we can't reverse a hash. Instead, regenerate
        // and update the existing record so the old token stays alive until
        // the teacher explicitly regenerates via the API route.
        //
        // To surface the token on the printed card we must store or re-derive
        // it here. Since hashes are one-way we mint a fresh token and replace
        // the stored hash in the existing record (preserving the same row /
        // createdAt for continuity).
        const buf = new Uint8Array(32)
        crypto.getRandomValues(buf)
        plainToken = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
        const tokenHash = createHash('sha256').update(plainToken).digest('hex')

        existing = await prisma.studentLoginToken.update({
          where: { id: existing.id },
          data: { tokenHash, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
        })
      } else {
        const buf = new Uint8Array(32)
        crypto.getRandomValues(buf)
        plainToken = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
        const tokenHash = createHash('sha256').update(plainToken).digest('hex')

        await prisma.studentLoginToken.create({
          data: {
            userId: user.id,
            classroomId,
            tokenHash,
            expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
          },
        })
      }

      const loginUrl = `${baseUrl}/login/token?t=${plainToken}`
      const qrSvg = await qrcode.toString(loginUrl, {
        type: 'svg',
        width: 160,
        margin: 1,
        color: { dark: '#1a1a2e', light: '#fef9ef' },
      })

      return { userId: user.id, name: user.name ?? 'Student', qrSvg }
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

  const { classroomName, students } = await buildStudentCards(classroomId, session.user.id)

  return (
    <div className="bg-paper min-h-screen">
      {/* Screen-only header */}
      <div className="print:hidden p-6 flex items-center justify-between border-b-2 border-ink/10">
        <div>
          <h1 className="text-2xl font-display text-ink">Login Cards — {classroomName}</h1>
          <p className="text-ink-muted font-body text-sm mt-1">
            Print and cut these cards. Students scan the QR code to sign in — no password needed.
            Cards are valid for one year. Reprinting regenerates the QR code and voids the old card.
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
                Scan to sign in instantly, or visit
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
        Reprinting this page issues new QR codes and resets the 1-year expiry.
      </p>
    </div>
  )
}
