'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StudentTable } from '@/components/teacher/StudentTable'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { ArrowLeft, Copy, Check, Users, Zap, BookOpen, Clock, UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'
import type { StudentProgress } from '@/types'

interface PendingMember {
  id: string
  userId: string
  joinedAt: string
  user: { id: string; name: string | null }
}

interface ClassDetail {
  id: string
  name: string
  description: string | null
  code: string
  members: Array<{
    id: string
    userId: string
    joinedAt: string
    user: { id: string; name: string | null; email: string | null; image: string | null; nameChangeRequested: boolean }
    averageWpm: number
    lessonsCompleted: number
  }>
  pendingMembers: PendingMember[]
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [classroom, setClassroom] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchClassroom = () => {
    if (!params.id) return
    fetch(`/api/teacher/classes/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setClassroom(data); setLoading(false) })
  }

  useEffect(() => { fetchClassroom() }, [params.id])

  const handleCopy = async () => {
    if (!classroom) return
    await navigator.clipboard.writeText(classroom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMemberAction = async (memberId: string, action: 'approve' | 'reject') => {
    if (!classroom) return
    setProcessingId(memberId)
    try {
      await fetch(`/api/teacher/classes/${classroom.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      fetchClassroom()
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <div className="p-6 text-slate-400">Loading...</div>
  if (!classroom || ('error' in (classroom as unknown as Record<string, unknown>))) {
    return <div className="p-6 text-slate-400">Class not found.</div>
  }

  const students: StudentProgress[] = classroom.members.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    email: null,
    image: null,
    nameChangeRequested: m.user.nameChangeRequested,
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

      {/* Join Code */}
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

      {/* Pending Requests */}
      {classroom.pendingMembers.length > 0 && (
        <div className="bg-amber-950/30 rounded-xl border border-amber-800/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-amber-300">
              Pending Requests ({classroom.pendingMembers.length})
            </h2>
          </div>
          <div className="space-y-2">
            {classroom.pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-slate-800/60 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium text-slate-300">
                    {(member.user.name ?? 'S')[0].toUpperCase()}
                  </div>
                  <span className="text-slate-200 text-sm font-medium">
                    {member.user.name ?? 'Anonymous'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMemberAction(member.id, 'approve')}
                    disabled={processingId === member.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleMemberAction(member.id, 'reject')}
                    disabled={processingId === member.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="font-semibold text-slate-200 mb-4">Class Progress Over Time</h2>
        <ProgressChart attempts={[]} />
      </div>

      <button
        onClick={() => {
          if (confirm('Delete this class? This cannot be undone.')) {
            fetch(`/api/teacher/classes/${classroom.id}`, { method: 'DELETE' })
              .then(() => router.push('/teacher/classes'))
          }
        }}
        className="text-sm text-red-400 hover:text-red-300 transition-colors"
      >
        Delete this class
      </button>
    </div>
  )
}
