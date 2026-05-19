'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'
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

  const SortButton = ({ col }: { col: SortKey; label: string }) => (
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
              <div className="flex items-center gap-1">
                Student
                <SortButton col="name" label="Name" />
              </div>
            </th>
            <th className="pb-3 pr-4 font-medium">
              <div className="flex items-center gap-1">
                Lessons
                <SortButton col="lessonsCompleted" label="Lessons" />
              </div>
            </th>
            <th className="pb-3 pr-4 font-medium">
              <div className="flex items-center gap-1">
                Avg WPM
                <SortButton col="averageWpm" label="Avg WPM" />
              </div>
            </th>
            <th className="pb-3 pr-4 font-medium">
              <div className="flex items-center gap-1">
                Accuracy
                <SortButton col="averageAccuracy" label="Accuracy" />
              </div>
            </th>
            <th className="pb-3 font-medium">Last Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {sorted.map((student) => {
            const lastAttempt = student.recentAttempts[0]
            return (
              <tr
                key={student.userId}
                onClick={() => router.push(`/teacher/students/${student.userId}`)}
                className="cursor-pointer hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {student.image ? (
                      <Image
                        src={student.image}
                        alt={student.name ?? 'Student'}
                        width={32}
                        height={32}
                        className="rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {(student.name ?? 'S')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-200">{student.name ?? 'Anonymous'}</p>
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
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
