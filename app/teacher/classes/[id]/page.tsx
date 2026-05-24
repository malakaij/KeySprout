'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StudentTable } from '@/components/teacher/StudentTable'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { ArrowLeft, Copy, Check, Users, Zap, BookOpen, Clock, UserCheck, UserX, Plus, X } from 'lucide-react'
import Link from 'next/link'
import type { StudentProgress } from '@/types'

interface PendingMember {
  id: string
  userId: string
  joinedAt: string
  user: { id: string; name: string | null }
}

interface AssignedCourse {
  id: string
  courseId: string
  title: string
  icon: string
  accent: string
}

interface AvailableCourse {
  id: string
  title: string
  icon: string
  accent: string
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
  assignedCourses: AssignedCourse[]
  availableCourses: AvailableCourse[]
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [classroom, setClassroom] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [assigningCourseId, setAssigningCourseId] = useState<string | null>(null)

  const fetchClassroom = () => {
    if (!params.id) return
    fetch(`/api/teacher/classes/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setClassroom(data); setLoading(false) })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchClassroom() }, [params.id])

  const handleCopy = async () => {
    if (!classroom) return
    await navigator.clipboard.writeText(classroom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAssignCourse = async (courseId: string) => {
    if (!classroom) return
    setAssigningCourseId(courseId)
    try {
      await fetch(`/api/teacher/classes/${classroom.id}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      fetchClassroom()
    } finally {
      setAssigningCourseId(null)
    }
  }

  const handleUnassignCourse = async (courseId: string) => {
    if (!classroom) return
    setAssigningCourseId(courseId)
    try {
      await fetch(`/api/teacher/classes/${classroom.id}/courses/${courseId}`, { method: 'DELETE' })
      fetchClassroom()
    } finally {
      setAssigningCourseId(null)
    }
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

  if (loading) return <div className="p-6 text-ink-muted font-body">Loading...</div>
  if (!classroom || ('error' in (classroom as unknown as Record<string, unknown>))) {
    return <div className="p-6 text-ink-muted font-body">Class not found.</div>
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
        <Link href="/teacher/classes" aria-label="Back to classes" className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display text-ink">{classroom.name}</h1>
          {classroom.description && <p className="text-ink-muted mt-0.5 font-body">{classroom.description}</p>}
        </div>
      </div>

      {/* Join Code */}
      <div className="kq-card p-5">
        <p className="text-sm text-ink-muted mb-2 font-body">Join Code — Share with students</p>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-mono font-bold text-ink tracking-widest bg-sunny/40 px-4 py-2 rounded-xl border-2 border-ink/30">
            {classroom.code}
          </div>
          <button
            onClick={handleCopy}
            className="kq-btn bg-paper-dark text-ink flex items-center gap-2 px-3 py-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-mint" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Pending Requests */}
      {classroom.pendingMembers.length > 0 && (
        <div className="kq-card p-5 border-sunny bg-sunny/5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-ink" />
            <h2 className="font-display text-ink">
              Pending Requests ({classroom.pendingMembers.length})
            </h2>
          </div>
          <div className="space-y-2">
            {classroom.pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-paper-dark rounded-xl px-4 py-3 border-2 border-ink/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sunny border-[3px] border-ink flex items-center justify-center text-xs font-display text-ink">
                    {(member.user.name ?? 'S')[0].toUpperCase()}
                  </div>
                  <span className="text-ink text-sm font-semibold">
                    {member.user.name ?? 'Anonymous'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMemberAction(member.id, 'approve')}
                    disabled={processingId === member.id}
                    className="kq-btn bg-mint text-ink flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleMemberAction(member.id, 'reject')}
                    disabled={processingId === member.id}
                    className="kq-btn bg-paper-dark text-ink-muted flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
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
        <div className="kq-card p-4 text-center">
          <Users className="w-5 h-5 text-sky mx-auto mb-2" />
          <p className="text-2xl font-display text-ink">{students.length}</p>
          <p className="text-xs text-ink-muted font-body">Students</p>
        </div>
        <div className="kq-card p-4 text-center">
          <Zap className="w-5 h-5 text-mint mx-auto mb-2" />
          <p className="text-2xl font-display text-ink">{avgWpm}</p>
          <p className="text-xs text-ink-muted font-body">Avg WPM</p>
        </div>
        <div className="kq-card p-4 text-center">
          <BookOpen className="w-5 h-5 text-sunny mx-auto mb-2" />
          <p className="text-2xl font-display text-ink">
            {students.length > 0
              ? Math.round(students.reduce((s, st) => s + st.lessonsCompleted, 0) / students.length)
              : 0}
          </p>
          <p className="text-xs text-ink-muted font-body">Avg Lessons</p>
        </div>
      </div>

      {/* Assigned Courses */}
      <div className="kq-card p-5 space-y-4">
        <h2 className="font-display text-ink">Assigned Courses</h2>
        <p className="text-sm font-body text-ink-muted -mt-2">
          Students approved into this class are automatically enrolled in these courses.
        </p>

        {classroom.assignedCourses.length === 0 && (
          <p className="text-sm font-body text-ink-muted italic">No courses assigned yet.</p>
        )}

        <div className="space-y-2">
          {classroom.assignedCourses.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-paper-dark rounded-xl px-4 py-2.5 border-2 border-ink/10">
              <span className="flex items-center gap-2 text-sm font-body text-ink">
                <span aria-hidden="true">{c.icon}</span>
                {c.title}
              </span>
              <button
                onClick={() => handleUnassignCourse(c.courseId)}
                disabled={assigningCourseId === c.courseId}
                className="text-ink-muted hover:text-coral transition-colors disabled:opacity-40"
                aria-label={`Remove ${c.title}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {classroom.availableCourses.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-body text-ink-muted uppercase tracking-wide">Add a course</p>
            {classroom.availableCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => handleAssignCourse(c.id)}
                disabled={assigningCourseId === c.id}
                className="w-full flex items-center gap-2 bg-paper border-2 border-dashed border-ink/20 rounded-xl px-4 py-2.5 text-sm font-body text-ink-muted hover:border-ink/40 hover:text-ink transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span aria-hidden="true">{c.icon}</span>
                {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-4">Students</h2>
        <StudentTable students={students} classroomId={classroom.id} />
      </div>

      <div className="kq-card p-5">
        <h2 className="font-display text-ink mb-4">Class Progress Over Time</h2>
        <ProgressChart attempts={[]} />
      </div>

      <button
        onClick={() => {
          if (confirm('Delete this class? This cannot be undone.')) {
            fetch(`/api/teacher/classes/${classroom.id}`, { method: 'DELETE' })
              .then(() => router.push('/teacher/classes'))
          }
        }}
        className="text-sm text-coral hover:text-coral/70 transition-colors font-body"
      >
        Delete this class
      </button>
    </div>
  )
}
