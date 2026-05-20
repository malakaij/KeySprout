import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { BarChart2, Users, TrendingUp, AlertTriangle } from 'lucide-react'

const KEYBOARD_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
]

const LEFT_KEYS = new Set(['q','w','e','r','t','a','s','d','f','g','z','x','c','v','b'])

function getKeyHeatColor(rate: number): string {
  if (rate === 0) return 'bg-paper-dark border-ink/20 text-ink/40'
  if (rate < 0.2) return 'bg-mint/40 border-ink/40 text-ink/70'
  if (rate < 0.4) return 'bg-sunny/50 border-ink/50 text-ink'
  if (rate < 0.6) return 'bg-coral/40 border-ink/50 text-ink'
  return 'bg-coral border-ink text-ink font-bold'
}

export default async function InsightsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const teacherId = session.user.id

  const classes = await prisma.classroom.findMany({
    where: { teacherId },
    include: {
      members: {
        where: { status: 'APPROVED' },
        include: {
          user: {
            include: {
              lessonAttempts: {
                include: {
                  lesson: {
                    include: { section: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const allMembers = classes.flatMap((c) => c.members)
  const allAttempts = allMembers.flatMap((m) => m.user.lessonAttempts)

  // Section performance: average accuracy per section
  const sectionStats = new Map<string, { title: string; accuracies: number[]; wpms: number[] }>()
  for (const attempt of allAttempts) {
    const sectionId = attempt.lesson.sectionId
    const sectionTitle = attempt.lesson.section.title
    if (!sectionStats.has(sectionId)) {
      sectionStats.set(sectionId, { title: sectionTitle, accuracies: [], wpms: [] })
    }
    const stats = sectionStats.get(sectionId)!
    stats.accuracies.push(attempt.accuracy)
    stats.wpms.push(attempt.wpm)
  }

  const sectionPerf = Array.from(sectionStats.entries()).map(([id, stats]) => ({
    id,
    title: stats.title,
    avgAccuracy: stats.accuracies.reduce((s, v) => s + v, 0) / stats.accuracies.length,
    avgWpm: stats.wpms.reduce((s, v) => s + v, 0) / stats.wpms.length,
    attempts: stats.accuracies.length,
  })).sort((a, b) => a.avgAccuracy - b.avgAccuracy)

  interface StudentSummary {
    userId: string
    name: string
    avgAcc: number
    avgWpm: number
    totalAttempts: number
    weakLessons: { title: string; avgAcc: number }[]
  }

  // Per-student summary
  const studentSummaries: StudentSummary[] = allMembers.flatMap((m) => {
    const attempts = m.user.lessonAttempts
    if (attempts.length === 0) return []

    const avgAcc = attempts.reduce((s, a) => s + a.accuracy, 0) / attempts.length
    const avgWpm = attempts.reduce((s, a) => s + a.wpm, 0) / attempts.length

    // Group by lesson, find worst 3 by accuracy
    const byLesson = new Map<string, { title: string; accs: number[] }>()
    for (const a of attempts) {
      if (!byLesson.has(a.lessonId)) {
        byLesson.set(a.lessonId, { title: a.lesson.title, accs: [] })
      }
      byLesson.get(a.lessonId)!.accs.push(a.accuracy)
    }
    const lessonAvgs = Array.from(byLesson.values()).map((l) => ({
      title: l.title,
      avgAcc: l.accs.reduce((s, v) => s + v, 0) / l.accs.length,
    })).sort((a, b) => a.avgAcc - b.avgAcc)

    return [{
      userId: m.userId,
      name: m.user.name ?? 'Unknown',
      avgAcc,
      avgWpm,
      totalAttempts: attempts.length,
      weakLessons: lessonAvgs.slice(0, 3),
    }]
  })

  // Key frequency heatmap: which keys appear most in low-accuracy lessons
  const keyErrorRate: Record<string, { errors: number; total: number }> = {}
  for (const attempt of allAttempts) {
    const content = attempt.lesson.content ?? ''
    for (const ch of content.toLowerCase()) {
      if (!/[a-z]/.test(ch)) continue
      if (!keyErrorRate[ch]) keyErrorRate[ch] = { errors: 0, total: 0 }
      keyErrorRate[ch].total++
      // Weight by inverse accuracy: low accuracy = more "errors" on this key's lesson
      keyErrorRate[ch].errors += (1 - attempt.accuracy)
    }
  }

  const keyRates: Record<string, number> = {}
  for (const [k, v] of Object.entries(keyErrorRate)) {
    keyRates[k] = v.total > 0 ? v.errors / v.total : 0
  }
  const maxRate = Math.max(...Object.values(keyRates), 0.01)
  const normalizedRates: Record<string, number> = {}
  for (const [k, v] of Object.entries(keyRates)) {
    normalizedRates[k] = v / maxRate
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display text-ink">Insights</h1>
        <p className="text-ink/50 mt-1 font-body">Class-wide performance patterns and student weak spots.</p>
      </div>

      {allAttempts.length === 0 ? (
        <div className="kq-card p-12 text-center">
          <BarChart2 className="w-12 h-12 text-ink/20 mx-auto mb-4" />
          <p className="text-ink/40 font-body">No lesson attempts yet.</p>
          <p className="text-sm text-ink/30 font-body mt-1">Students need to complete lessons for insights to appear.</p>
        </div>
      ) : (
        <>
          {/* Section Performance */}
          <div className="kq-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sky" />
              <h2 className="font-display text-ink">Section Performance</h2>
            </div>
            <p className="text-xs text-ink/40 font-body mb-4">Sorted by average accuracy — lowest first (most challenging).</p>
            <div className="space-y-3">
              {sectionPerf.map((sec, i) => (
                <div key={sec.id} className="flex items-center gap-4">
                  <div className="w-32 truncate text-sm font-body text-ink/70">{sec.title}</div>
                  <div className="flex-1 h-6 bg-paper-dark rounded-full border-2 border-ink/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sec.avgAccuracy >= 0.9 ? 'bg-mint' :
                        sec.avgAccuracy >= 0.8 ? 'bg-sky' :
                        sec.avgAccuracy >= 0.7 ? 'bg-sunny' : 'bg-coral'
                      }`}
                      style={{ width: `${Math.round(sec.avgAccuracy * 100)}%` }}
                    />
                  </div>
                  <div className="text-sm font-display text-ink w-12 text-right">
                    {Math.round(sec.avgAccuracy * 100)}%
                  </div>
                  <div className="text-xs text-ink/40 font-body w-16 text-right">
                    {Math.round(sec.avgWpm)} WPM
                  </div>
                  {i === 0 && (
                    <span className="kq-chip bg-coral/20 text-ink border-coral text-xs">Hardest</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Heatmap */}
          <div className="kq-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-coral" />
              <h2 className="font-display text-ink">Keyboard Difficulty Heatmap</h2>
            </div>
            <p className="text-xs text-ink/40 font-body mb-4">
              Keys appearing frequently in low-accuracy lessons are shown in red. Green = easy, red = challenging.
            </p>
            <div className="inline-flex flex-col items-center gap-1.5 mx-auto">
              {KEYBOARD_ROWS.map((row, ri) => (
                <div
                  key={ri}
                  className="flex gap-1.5"
                  style={{ paddingLeft: ri === 1 ? '0.875rem' : ri === 2 ? '1.75rem' : 0 }}
                >
                  {row.map((k) => {
                    const rate = normalizedRates[k] ?? 0
                    const colorClass = getKeyHeatColor(rate)
                    return (
                      <div
                        key={k}
                        className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-mono uppercase transition-all ${colorClass}`}
                        title={`${k.toUpperCase()}: ${keyErrorRate[k] ? Math.round((keyErrorRate[k].errors / keyErrorRate[k].total) * 100) : 0}% difficulty`}
                      >
                        {k}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div className="h-7 rounded-lg border-2 bg-paper-dark border-ink/20 flex items-center justify-center text-xs font-mono text-ink/40" style={{ width: '14rem' }}>
                space
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 text-xs text-ink/40 font-body justify-center">
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-mint/40 border border-ink/30 inline-block" /> Easy</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-sunny/50 border border-ink/40 inline-block" /> Medium</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-coral border border-ink inline-block" /> Hard</span>
            </div>
          </div>

          {/* Per-Student Weak Spots */}
          <div className="kq-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-sunny" />
              <h2 className="font-display text-ink">Student Weak Spots</h2>
            </div>
            <div className="space-y-4">
              {studentSummaries.map((student) => (
                <div key={student.userId} className="p-4 bg-paper-dark rounded-xl border-2 border-ink/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-grape border-[3px] border-ink flex items-center justify-center text-xs font-display text-white">
                        {student.name[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-ink text-sm">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-ink/50 font-body">
                      <span><span className="font-display text-mint text-sm">{Math.round(student.avgWpm)}</span> WPM</span>
                      <span><span className="font-display text-sky text-sm">{Math.round(student.avgAcc * 100)}%</span> acc</span>
                      <span>{student.totalAttempts} attempts</span>
                    </div>
                  </div>
                  {student.weakLessons.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-ink/40 font-body">Lowest accuracy lessons:</p>
                      {student.weakLessons.map((lesson, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-body">
                          <span className="text-ink/70 truncate flex-1 mr-2">{lesson.title}</span>
                          <span className={`font-semibold ${
                            lesson.avgAcc >= 0.9 ? 'text-mint' :
                            lesson.avgAcc >= 0.8 ? 'text-sky' :
                            lesson.avgAcc >= 0.7 ? 'text-sunny' : 'text-coral'
                          }`}>
                            {Math.round(lesson.avgAcc * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {studentSummaries.length === 0 && (
                <p className="text-center text-ink/30 font-body py-6">No students with lesson attempts yet.</p>
              )}
            </div>
          </div>

          {/* Class Overview */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="kq-card p-4 text-center">
              <Users className="w-6 h-6 text-sky mx-auto mb-2" />
              <p className="text-2xl font-display text-ink">{allMembers.length}</p>
              <p className="text-xs text-ink/50 font-body">Total Students</p>
            </div>
            <div className="kq-card p-4 text-center">
              <TrendingUp className="w-6 h-6 text-mint mx-auto mb-2" />
              <p className="text-2xl font-display text-ink">
                {allAttempts.length > 0
                  ? Math.round(allAttempts.reduce((s, a) => s + a.wpm, 0) / allAttempts.length)
                  : 0}
              </p>
              <p className="text-xs text-ink/50 font-body">Class Avg WPM</p>
            </div>
            <div className="kq-card p-4 text-center">
              <BarChart2 className="w-6 h-6 text-coral mx-auto mb-2" />
              <p className="text-2xl font-display text-ink">
                {allAttempts.length > 0
                  ? Math.round(allAttempts.reduce((s, a) => s + a.accuracy, 0) / allAttempts.length * 100)
                  : 0}%
              </p>
              <p className="text-xs text-ink/50 font-body">Class Avg Accuracy</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
