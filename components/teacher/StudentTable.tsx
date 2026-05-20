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
      className="flex items-center gap-1 hover:text-ink transition-colors"
    >
      <ArrowUpDown className="w-3 h-3" />
    </button>
  )

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-ink/40 font-body">
        <p>No students have joined this class yet.</p>
        <p className="text-sm mt-1">Share the class code with your students.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-ink/40 border-b-2 border-ink/10">
            <th className="pb-3 pr-4 font-semibold font-body">
              <div className="flex items-center gap-1">Student <SortButton col="name" /></div>
            </th>
            <th className="pb-3 pr-4 font-semibold font-body">
              <div className="flex items-center gap-1">Lessons <SortButton col="lessonsCompleted" /></div>
            </th>
            <th className="pb-3 pr-4 font-semibold font-body">
              <div className="flex items-center gap-1">Avg WPM <SortButton col="averageWpm" /></div>
            </th>
            <th className="pb-3 pr-4 font-semibold font-body">
              <div className="flex items-center gap-1">Accuracy <SortButton col="averageAccuracy" /></div>
            </th>
            <th className="pb-3 font-semibold font-body">Last Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {sorted.map((student) => {
            const lastAttempt = student.recentAttempts[0]
            const isExpanded = expandedId === student.userId
            return (
              <>
                <tr
                  key={student.userId}
                  onClick={() => router.push(`/teacher/students/${student.userId}`)}
                  className="cursor-pointer hover:bg-paper-dark transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-mint border-[3px] border-ink flex items-center justify-center text-xs font-display text-ink flex-shrink-0">
                        {(student.name ?? 'S')[0].toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink">{student.name ?? 'Anonymous'}</p>
                        {student.nameChangeRequested && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              isExpanded ? closePanel() : openPanel(student.userId)
                            }}
                            title="Student requested a name change"
                            className="flex items-center gap-1 px-1.5 py-0.5 bg-sunny/30 hover:bg-sunny/50 border-2 border-sunny/60 rounded-full text-ink text-xs transition-colors font-body"
                          >
                            <MessageSquare className="w-3 h-3" />
                            rename?
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-ink/70 font-body">{student.lessonsCompleted}</td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      'font-display',
                      student.averageWpm >= 40 ? 'text-mint' :
                      student.averageWpm >= 25 ? 'text-sunny' : 'text-ink/60'
                    )}>
                      {Math.round(student.averageWpm)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={cn(
                      'font-semibold font-body',
                      student.averageAccuracy >= 0.95 ? 'text-mint' :
                      student.averageAccuracy >= 0.85 ? 'text-sunny' : 'text-coral'
                    )}>
                      {Math.round(student.averageAccuracy * 100)}%
                    </span>
                  </td>
                  <td className="py-3 text-ink/40 text-xs font-body">
                    {lastAttempt ? formatDate(new Date(lastAttempt.completedAt)) : 'Never'}
                  </td>
                </tr>

                {isExpanded && (
                  <tr key={`${student.userId}-panel`}>
                    <td colSpan={5} className="pb-3 pt-0">
                      <div className="mx-1 p-4 bg-sunny/10 border-2 border-sunny/40 rounded-xl space-y-3">
                        <p className="text-xs text-ink font-semibold font-body">
                          Assign a new username for {student.name ?? 'this student'}
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="Enter a name…"
                            className="flex-1 bg-paper border-2 border-ink/30 rounded-xl px-3 py-2 text-ink placeholder-ink/30 focus:outline-none focus:border-ink text-sm font-body"
                          />
                          <button
                            onClick={fetchSuggestion}
                            disabled={loadingSuggestion}
                            title="Suggest a random name"
                            className="p-2 bg-paper-dark border-2 border-ink/20 hover:border-ink rounded-xl text-ink/60 hover:text-ink transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={cn('w-4 h-4', loadingSuggestion && 'animate-spin')} />
                          </button>
                        </div>
                        {suggestion && (
                          <p className="text-xs text-ink/50 font-body">
                            Suggestion:{' '}
                            <button
                              onClick={() => setCustomName(suggestion)}
                              className="text-sky font-semibold hover:underline"
                            >
                              {suggestion}
                            </button>
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => applyName(student.userId)}
                            disabled={applying || !customName.trim()}
                            className="kq-btn bg-mint text-ink flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {applying ? 'Applying…' : 'Apply'}
                          </button>
                          <button
                            onClick={closePanel}
                            className="kq-btn bg-paper-dark text-ink/60 px-3 py-1.5 text-xs"
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
