import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Users, Zap, BookOpen, Plus } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const teacherId = session.user.id

  const classes = await prisma.classroom.findMany({
    where: { teacherId },
    include: {
      members: {
        include: {
          user: {
            include: {
              lessonAttempts: { orderBy: { completedAt: 'desc' }, take: 5 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalStudents = classes.reduce((sum, c) => sum + c.members.length, 0)

  const allAttempts = classes.flatMap((c) =>
    c.members.flatMap((m) => m.user.lessonAttempts)
  )

  const avgWpm = allAttempts.length > 0
    ? Math.round(allAttempts.reduce((s, a) => s + a.wpm, 0) / allAttempts.length)
    : 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-ink">Teacher Dashboard</h1>
          <p className="text-ink-muted mt-1 font-body">Manage your classes and track student progress.</p>
        </div>
        <Link
          href="/teacher/classes"
          className="kq-btn bg-mint text-ink flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          label="Total Classes"
          value={classes.length}
          icon={<BookOpen className="w-5 h-5 text-mint" />}
        />
        <StatsCard
          label="Total Students"
          value={totalStudents}
          icon={<Users className="w-5 h-5 text-sky" />}
        />
        <StatsCard
          label="Avg WPM (All Students)"
          value={avgWpm}
          icon={<Zap className="w-5 h-5 text-sunny" />}
        />
      </div>

      <div>
        <h2 className="font-display text-lg text-ink mb-4">Your Classes</h2>
        {classes.length === 0 ? (
          <div className="kq-card p-8 text-center">
            <p className="text-ink-muted font-body mb-4">No classes yet. Create one to get started!</p>
            <Link
              href="/teacher/classes"
              className="kq-btn bg-mint text-ink inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Your First Class
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {classes.map((c) => {
              const memberAttempts = c.members.flatMap((m) => m.user.lessonAttempts)
              const classAvgWpm = memberAttempts.length > 0
                ? Math.round(memberAttempts.reduce((s, a) => s + a.wpm, 0) / memberAttempts.length)
                : 0
              return (
                <Link
                  key={c.id}
                  href={`/teacher/classes/${c.id}`}
                  className="kq-card p-5 hover:shadow-ink-lg transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 block"
                >
                  <h3 className="font-display text-ink mb-1">{c.name}</h3>
                  {c.description && <p className="text-xs text-ink-muted mb-3 font-body">{c.description}</p>}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-ink-muted font-body">
                      <Users className="w-4 h-4" />
                      <span>{c.members.length} students</span>
                    </div>
                    <div className="flex items-center gap-1 text-mint font-semibold">
                      <Zap className="w-4 h-4" />
                      <span>{classAvgWpm} avg WPM</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-ink-muted font-body">Code:</span>
                    <span className="font-mono text-ink font-bold tracking-widest text-xs bg-sunny/40 px-2 py-0.5 rounded-lg">
                      {c.code}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
