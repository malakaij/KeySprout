'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, RefreshCw, Check, MessageSquare } from 'lucide-react'
import type { StudentProgress } from '@/types'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface StudentTableProps {
  students: StudentProgress[]
  classroomId: string
}

type SortKey = 'name' | 'lessonsCompleted' | 'averageWpm' | 'averageAccuracy'

export function StudentTable({ students, classroomId: _classroomId }: StudentTableProps) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('averageWpm')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState('')
  const [customName, setCustomName] = useState('')
  const [applying, setApplying] = useState(false)
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  const sorted = [...students].sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av)
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const fetchSuggestion = async () => {
    setLoadingSuggestion(true)
    try {
      const res = await fetch('/api/names/suggest')
      const data = await res.json()
      setSuggestion(data.name)
      setCustomName(data.name)
    } finally {
      setLoadingSuggestion(false)
    }
  }

  const openPanel = async (userId: string) => {
    setExpandedId(userId)
    setCustomName('')
    setSuggestion('')
    await fetchSuggestion()
  }

  const closePanel = () => {
    setExpandedId(null)
    setSuggestion('')
    setCustomName('')
  }

  const applyName = async (userId: string) => {
    if (!customName.trim()) return
    setApplying(true)
    try {
      const res = await fetch(`/api/teacher/students/${userId}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customName.trim() }),
      })
      if (res.ok) {
        closePanel()
        router.refresh()
      }
    } finally {
      setApplying(false)
    }
  }

  const SortButton = ({ col }: { col: SortKey }) => (
    <button
      onClick={() => handleSort(col)}
      className="flex items-center gap-1 hover:text-slate-200 transition-colors"
    >
      <ArrowUpDown className="w-3 h-3" />
    </button>
  )

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No students have joined this class yet.</p>
        <p className="text-sm mt-1">Share the class code with your students.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
            <th className="pb-3 pr-4 font-medium">
              <div className="flex items-center gap-1">Student <SortButton col="name" /></div>
            </th>
            <th className="pb-3 pr-4 font-medium">
              <div className="flex items-center gap-1">Lessons <SortButton col="lessonsCompleted" /></div>
            </th>
            <th className="pb-3 pr-4 font-medium">
              <div className="flex items-center gap-1">Avg WPM <SortButton col="averageWpm" /></div>
            </th>
            <th className="pb-3 pr-4 font-medium">
              <div className="flex items-center gap-1">Accuracy <SortButton col="averageAccuracy" /></div>
            </th>
            <th className="pb-3 font-medium">Last Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {sorted.map((student) => {
            const lastAttempt = student.recentAttempts[0]
            const isExpanded = expandedId === student.userId
            return (
              <>
                <tr
                  key={student.userId}
                  onClick={() => router.push(`/teacher/students/${student.userId}`)}
                  className="cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {(student.name ?? 'S')[0].toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-200">{student.name ?? 'Anonymous'}</p>
                        {student.nameChangeRequested && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              isExpanded ? closePanel() : openPanel(student.userId)
                            }}
                            title="Student requested a name change"
                            className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-900/50 hover:bg-amber-800/60 border border-amber-700/50 rounded text-amber-400 text-xs transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            rename?
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">{student.lessonsCompleted}</td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      'font-semibold',
                      student.averageWpm >= 40 ? 'text-emerald-400' :
                      student.averageWpm >= 25 ? 'text-amber-400' : 'text-slate-300'
                    )}>
                      {Math.round(student.averageWpm)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      'font-semibold',
                      student.averageAccuracy >= 0.95 ? 'text-emerald-400' :
                      student.averageAccuracy >= 0.85 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {Math.round(student.averageAccuracy * 100)}%
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-xs">
                    {lastAttempt ? formatDate(new Date(lastAttempt.completedAt)) : 'Never'}
                  </td>
                </tr>

                {isExpanded && (
                  <tr key={`${student.userId}-panel`}>
                    <td colSpan={5} className="pb-3 pt-0">
                      <div className="mx-1 p-4 bg-amber-950/20 border border-amber-800/40 rounded-lg space-y-3">
                        <p className="text-xs text-amber-300 font-medium">
                          Assign a new username for {student.name ?? 'this student'}
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Enter a name…"
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                          />
                          <button
                            onClick={fetchSuggestion}
                            disabled={loadingSuggestion}
                            title="Suggest a random name"
                            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={cn('w-4 h-4', loadingSuggestion && 'animate-spin')} />
                          </button>
                        </div>
                        {suggestion && (
                          <p className="text-xs text-slate-400">
                            Suggestion:{' '}
                            <button
                              onClick={() => setCustomName(suggestion)}
                              className="text-amber-400 hover:underline"
                            >
                              {suggestion}
                            </button>
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => applyName(student.userId)}
                            disabled={applying || !customName.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {applying ? 'Applying…' : 'Apply'}
                          </button>
                          <button
                            onClick={closePanel}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
