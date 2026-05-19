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

  if (loading) return <div className="p-6 text-slate-400">Loading...</div>
  if (!data || !data.student) return <div className="p-6 text-slate-400">Student not found.</div>

  const { student, lessonStats, chartData, weakKeys, totalAttempts } = data

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/classes" className="text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          {student.image ? (
            <Image
              src={student.image}
              alt={student.name ?? 'Student'}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-lg font-bold">
              {student.name?.[0] ?? student.email[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-100">{student.name ?? 'Unknown'}</h1>
            <div className="flex items-center gap-3 text-xs text-slate-400">
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
          <p className="text-2xl font-bold text-emerald-400">{totalAttempts}</p>
          <p className="text-xs text-slate-400">Total Attempts</p>
        </div>
      </div>

      {/* WPM Chart */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-4">Progress Over Time</h2>
        <ProgressChart attempts={chartData} />
      </div>

      {/* Lesson Stats */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-4">Lesson Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-700">
                <th className="text-left pb-2 font-medium">Lesson</th>
                <th className="text-left pb-2 font-medium">Unit</th>
                <th className="text-right pb-2 font-medium">Attempts</th>
                <th className="text-right pb-2 font-medium">Best WPM</th>
                <th className="text-right pb-2 font-medium">Best Acc</th>
                <th className="text-right pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {lessonStats.map((ls) => (
                <tr key={ls.lessonId}>
                  <td className="py-2 text-slate-300">{ls.title}</td>
                  <td className="py-2 text-slate-400 text-xs">{ls.unit}</td>
                  <td className="py-2 text-right text-slate-400">{ls.attemptsCount}</td>
                  <td className="py-2 text-right font-medium text-emerald-400">{Math.round(ls.bestWpm)}</td>
                  <td className="py-2 text-right text-blue-400">{Math.round(ls.bestAccuracy * 100)}%</td>
                  <td className="py-2 text-right">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      ls.passed
                        ? 'bg-emerald-900/50 text-emerald-400'
                        : 'bg-red-900/50 text-red-400'
                    )}>
                      {ls.passed ? 'Passed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
              {lessonStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">No lessons attempted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weak Keys Heatmap */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-2">Weak Keys Heatmap</h2>
        <p className="text-xs text-slate-400 mb-4">Keys with higher error rates are shown in red.</p>
        <VirtualKeyboard errorKeys={weakKeys} />
      </div>
    </div>
  )
}
