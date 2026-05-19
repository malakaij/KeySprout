'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StudentTable } from '@/components/teacher/StudentTable'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { ArrowLeft, Copy, Check, Users, Zap, BookOpen } from 'lucide-react'
import Link from 'next/link'
import type { StudentProgress } from '@/types'

interface ClassDetail {
  id: string
  name: string
  description: string | null
  code: string
  members: Array<{
    id: string
    userId: string
    joinedAt: string
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    }
    averageWpm: number
    lessonsCompleted: number
  }>
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [classroom, setClassroom] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/teacher/classes/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setClassroom(data)
        setLoading(false)
      })
  }, [params.id])

  const handleCopy = async () => {
    if (!classroom) return
    await navigator.clipboard.writeText(classroom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="p-6 text-slate-400">Loading...</div>
  }
  if (!classroom || ('error' in (classroom as unknown as Record<string, unknown>))) {
    return <div className="p-6 text-slate-400">Class not found.</div>
  }

  const students: StudentProgress[] = classroom.members.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image,
    totalAttempts: 0,
    averageWpm: m.averageWpm,
    averageAccuracy: 0.9,
    lessonsCompleted: m.lessonsCompleted,
    recentAttempts: [],
  }))

  const avgWpm = students.length > 0
    ? Math.round(students.reduce((s, st) => s + st.averageWpm, 0) / students.length)
    : 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/classes" className="text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-100">{classroom.name}</h1>
          {classroom.description && <p className="text-slate-400 mt-0.5">{classroom.description}</p>}
        </div>
      </div>

      {/* Class Code */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <p className="text-sm text-slate-400 mb-2">Join Code — Share with students</p>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-mono font-bold text-amber-400 tracking-widest">
            {classroom.code}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-100">{students.length}</p>
          <p className="text-xs text-slate-400">Students</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-100">{avgWpm}</p>
          <p className="text-xs text-slate-400">Avg WPM</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <BookOpen className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-100">
            {students.length > 0
              ? Math.round(students.reduce((s, st) => s + st.lessonsCompleted, 0) / students.length)
              : 0}
          </p>
          <p className="text-xs text-slate-400">Avg Lessons</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-4">Students</h2>
        <StudentTable students={students} classroomId={classroom.id} />
      </div>

      {/* Chart placeholder */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-4">Class Progress Over Time</h2>
        <ProgressChart attempts={[]} />
      </div>
    </div>
  )
}
