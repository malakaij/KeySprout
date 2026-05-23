'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mail, Calendar } from 'lucide-react'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { VirtualKeyboard } from '@/components/typing/VirtualKeyboard'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StudentData {
  student: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: string
  }
  lessonStats: Array<{
    lessonId: string
    title: string
    unit: string
    attemptsCount: number
    bestWpm: number
    bestAccuracy: number
    passed: boolean
  }>
  chartData: Array<{ date: string; wpm: number; accuracy: number }>
  weakKeys: Record<string, number>
  totalAttempts: number
}

export default function StudentDetailPage() {
  const params = useParams()
  const [data, setData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/teacher/students/${params.id}/progress`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
  }, [params.id])

  if (loading) return <div className="p-6 text-ink-muted font-body">Loading...</div>
  if (!data || !data.student) return <div className="p-6 text-ink-muted font-body">Student not found.</div>

  const { student, lessonStats, chartData, weakKeys, totalAttempts } = data

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/classes" className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          {student.image ? (
            <Image
              src={student.image}
              alt={student.name ?? 'Student'}
              width={48}
              height={48}
              className="rounded-full border-[3px] border-ink"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-grape border-[3px] border-ink flex items-center justify-center text-lg font-display text-white">
              {student.name?.[0] ?? student.email[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-display text-ink">{student.name ?? 'Unknown'}</h1>
            <div className="flex items-center gap-3 text-xs text-ink-muted font-body">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {student.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Joined {formatDate(new Date(student.createdAt))}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display text-mint">{totalAttempts}</p>
          <p className="text-xs text-ink-muted font-body">Total Attempts</p>
        </div>
      </div>

      {/* WPM Chart */}
      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-4">Progress Over Time</h2>
        <ProgressChart attempts={chartData} />
      </div>

      {/* Lesson Stats */}
      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-4">Lesson Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-ink-muted border-b-2 border-ink/10">
                <th className="text-left pb-2 font-semibold font-body">Lesson</th>
                <th className="text-left pb-2 font-semibold font-body">Unit</th>
                <th className="text-right pb-2 font-semibold font-body">Attempts</th>
                <th className="text-right pb-2 font-semibold font-body">Best WPM</th>
                <th className="text-right pb-2 font-semibold font-body">Best Acc</th>
                <th className="text-right pb-2 font-semibold font-body">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {lessonStats.map((ls) => (
                <tr key={ls.lessonId} className="hover:bg-paper-dark transition-colors">
                  <td className="py-2 text-ink font-body">{ls.title}</td>
                  <td className="py-2 text-ink-muted text-xs font-body">{ls.unit}</td>
                  <td className="py-2 text-right text-ink-muted font-body">{ls.attemptsCount}</td>
                  <td className="py-2 text-right font-display text-mint">{Math.round(ls.bestWpm)}</td>
                  <td className="py-2 text-right text-sky font-semibold font-body">{Math.round(ls.bestAccuracy * 100)}%</td>
                  <td className="py-2 text-right">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full border-2 font-semibold font-body',
                      ls.passed
                        ? 'bg-mint/20 text-ink border-mint'
                        : 'bg-coral/20 text-ink border-coral'
                    )}>
                      {ls.passed ? 'Passed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
              {lessonStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-muted font-body">No lessons attempted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weak Keys Heatmap */}
      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-2">Weak Keys Heatmap</h2>
        <p className="text-xs text-ink-muted mb-4 font-body">Keys with higher error rates are shown in red.</p>
        <VirtualKeyboard errorKeys={weakKeys} />
      </div>
    </div>
  )
}
