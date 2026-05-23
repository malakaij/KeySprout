'use client'

import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { VirtualKeyboard } from '@/components/typing/VirtualKeyboard'
import { formatDate } from '@/lib/utils'
import { sectionColor } from '@/lib/section-colors'

interface AttemptData {
  date: string
  wpm: number
  accuracy: number
}

interface UnitStat {
  name: string
  total: number
  passed: number
}

interface RecentAttempt {
  id: string
  lessonTitle: string
  wpm: number
  accuracy: number
  errors: number
  completedAt: string
}

interface ProgressClientProps {
  chartData: AttemptData[]
  unitStats: UnitStat[]
  weakKeys: Record<string, number>
  recentAttempts: RecentAttempt[]
}

export function ProgressClient({ chartData, unitStats, weakKeys, recentAttempts }: ProgressClientProps) {
  const topWeakKeys = Object.entries(weakKeys)
    .filter(([, rate]) => rate > 0.1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display text-ink">Your Progress</h1>
        <p className="text-ink-muted mt-1 font-body">Track your typing improvement over time.</p>
      </div>

      {/* WPM Chart */}
      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-4">WPM Over Time</h2>
        <ProgressChart attempts={chartData} />
      </div>

      {/* Unit Progress */}
      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-4">Curriculum Progress</h2>
        <div className="space-y-4">
          {unitStats.map((unit, i) => {
            const pct = unit.total > 0 ? (unit.passed / unit.total) * 100 : 0
            const c = sectionColor(i)
            return (
              <div key={unit.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold px-3 py-0.5 rounded-full border-2 font-body ${c.badgeClass}`}>
                    {unit.name}
                  </span>
                  <span className="text-xs text-ink-muted font-body">{unit.passed}/{unit.total} passed</span>
                </div>
                <div className="w-full bg-paper-dark rounded-full h-3 border-2 border-ink/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${c.solid}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weak Keys */}
      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-2">Weak Keys Heatmap</h2>
        <p className="text-xs text-ink-muted mb-4 font-body">
          Keys colored red are your most challenging. Practice them with personalized exercises.
        </p>
        <VirtualKeyboard errorKeys={weakKeys} fingerColors={false} />
        {topWeakKeys.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-ink-muted mb-2 font-body">Your most challenging keys:</p>
            <div className="flex flex-wrap gap-2">
              {topWeakKeys.map(([key, rate]) => (
                <div key={key} className="flex items-center gap-1.5 bg-coral/10 border-2 border-coral rounded-full px-3 py-1">
                  <span className="font-mono font-bold text-ink">{key}</span>
                  <span className="text-xs text-coral font-body">{Math.round(rate * 100)}% error</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {topWeakKeys.length === 0 && (
          <p className="text-sm text-ink-muted mt-4 text-center font-body">
            Complete some lessons to see your weak key analysis!
          </p>
        )}
      </div>

      {/* Recent Attempts */}
      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-4">Recent Attempts</h2>
        {recentAttempts.length === 0 ? (
          <p className="text-ink-muted text-sm text-center py-4 font-body">No attempts yet. Start a lesson!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-ink-muted border-b-2 border-ink/10">
                  <th className="text-left pb-2 font-semibold font-body">Lesson</th>
                  <th className="text-right pb-2 font-semibold font-body">WPM</th>
                  <th className="text-right pb-2 font-semibold font-body">Accuracy</th>
                  <th className="text-right pb-2 font-semibold font-body">Errors</th>
                  <th className="text-right pb-2 font-semibold font-body">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {recentAttempts.map((a) => (
                  <tr key={a.id} className="hover:bg-paper-dark transition-colors">
                    <td className="py-2 text-ink font-body">{a.lessonTitle}</td>
                    <td className="py-2 text-right font-display text-mint">{Math.round(a.wpm)}</td>
                    <td className="py-2 text-right text-sky font-semibold font-body">{Math.round(a.accuracy * 100)}%</td>
                    <td className="py-2 text-right text-coral font-body">{a.errors}</td>
                    <td className="py-2 text-right text-ink-muted text-xs font-body">{formatDate(new Date(a.completedAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
