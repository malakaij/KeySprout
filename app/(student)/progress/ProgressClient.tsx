'use client'

import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { VirtualKeyboard } from '@/components/typing/VirtualKeyboard'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AttemptData {
  date: string
  wpm: number
  accuracy: number
}

interface UnitStat {
  name: string
  total: number
  passed: number
  color: string
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

const COLOR_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-900/50 border-emerald-800 text-emerald-400',
  blue: 'bg-blue-900/50 border-blue-800 text-blue-400',
  purple: 'bg-purple-900/50 border-purple-800 text-purple-400',
  amber: 'bg-amber-900/50 border-amber-800 text-amber-400',
  red: 'bg-red-900/50 border-red-800 text-red-400',
}

const PROGRESS_BAR_COLORS: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
}

export function ProgressClient({ chartData, unitStats, weakKeys, recentAttempts }: ProgressClientProps) {
  const topWeakKeys = Object.entries(weakKeys)
    .filter(([, rate]) => rate > 0.1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Your Progress</h1>
        <p className="text-slate-400 mt-1">Track your typing improvement over time.</p>
      </div>

      {/* WPM Chart */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-4">WPM Over Time</h2>
        <ProgressChart attempts={chartData} />
      </div>

      {/* Unit Progress */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-4">Curriculum Progress</h2>
        <div className="space-y-3">
          {unitStats.map((unit) => {
            const pct = unit.total > 0 ? (unit.passed / unit.total) * 100 : 0
            const colorClass = COLOR_CLASSES[unit.color] ?? COLOR_CLASSES.emerald
            const barColor = PROGRESS_BAR_COLORS[unit.color] ?? 'bg-emerald-500'
            return (
              <div key={unit.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-sm font-medium px-2 py-0.5 rounded border', colorClass)}>
                    {unit.name}
                  </span>
                  <span className="text-xs text-slate-400">{unit.passed}/{unit.total}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={cn('h-2 rounded-full transition-all', barColor)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weak Keys */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-2">Weak Keys Heatmap</h2>
        <p className="text-xs text-slate-400 mb-4">
          Keys colored red are your most challenging. Practice them with personalized exercises.
        </p>
        <VirtualKeyboard errorKeys={weakKeys} fingerColors={false} />
        {topWeakKeys.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Your most challenging keys:</p>
            <div className="flex flex-wrap gap-2">
              {topWeakKeys.map(([key, rate]) => (
                <div key={key} className="flex items-center gap-1.5 bg-red-900/30 border border-red-800 rounded-lg px-3 py-1">
                  <span className="font-mono font-bold text-red-400">{key}</span>
                  <span className="text-xs text-red-300">{Math.round(rate * 100)}% error</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {topWeakKeys.length === 0 && (
          <p className="text-sm text-slate-400 mt-4 text-center">
            Complete some lessons to see your weak key analysis!
          </p>
        )}
      </div>

      {/* Recent Attempts */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-4">Recent Attempts</h2>
        {recentAttempts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No attempts yet. Start a lesson!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-700">
                  <th className="text-left pb-2 font-medium">Lesson</th>
                  <th className="text-right pb-2 font-medium">WPM</th>
                  <th className="text-right pb-2 font-medium">Accuracy</th>
                  <th className="text-right pb-2 font-medium">Errors</th>
                  <th className="text-right pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentAttempts.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 text-slate-300">{a.lessonTitle}</td>
                    <td className="py-2 text-right font-medium text-emerald-400">{Math.round(a.wpm)}</td>
                    <td className="py-2 text-right text-blue-400">{Math.round(a.accuracy * 100)}%</td>
                    <td className="py-2 text-right text-red-400">{a.errors}</td>
                    <td className="py-2 text-right text-slate-500 text-xs">{formatDate(new Date(a.completedAt))}</td>
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
