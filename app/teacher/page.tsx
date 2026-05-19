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
          <h1 className="text-2xl font-bold text-slate-100">Teacher Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your classes and track student progress.</p>
        </div>
        <Link
          href="/teacher/classes"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          label="Total Classes"
          value={classes.length}
          icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
        />
        <StatsCard
          label="Total Students"
          value={totalStudents}
          icon={<Users className="w-5 h-5 text-blue-400" />}
        />
        <StatsCard
          label="Avg WPM (All Students)"
          value={avgWpm}
          icon={<Zap className="w-5 h-5 text-amber-400" />}
        />
      </div>

      <div>
        <h2 className="font-semibold text-slate-200 mb-4">Your Classes</h2>
        {classes.length === 0 ? (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
            <p className="text-slate-400 mb-4">No classes yet. Create one to get started!</p>
            <Link
              href="/teacher/classes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors text-sm"
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
                  className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-500 transition-colors"
                >
                  <h3 className="font-semibold text-slate-100 mb-1">{c.name}</h3>
                  {c.description && <p className="text-xs text-slate-400 mb-3">{c.description}</p>}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{c.members.length} students</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Zap className="w-4 h-4" />
                      <span>{classAvgWpm} avg WPM</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Code:</span>
                    <span className="font-mono text-amber-400 font-bold tracking-widest text-xs">
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
