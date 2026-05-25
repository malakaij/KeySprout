'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StudentTable } from '@/components/teacher/StudentTable'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { ArrowLeft, Copy, Check, Users, Zap, BookOpen, Clock, UserCheck, UserX, Plus, X, UserPlus, Printer, Download, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import type { StudentProgress } from '@/types'
import { getNames, setName } from '@/lib/name-cache'

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
  const [addCount, setAddCount] = useState(1)
  const [addLoading, setAddLoading] = useState(false)
  const [newStudents, setNewStudents] = useState<Array<{ userId: string; name: string; password: string }>>([])
  const [passwordReveal, setPasswordReveal] = useState<Record<string, string>>({})
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({})
  const [nameEditing, setNameEditing] = useState<string | null>(null)

  const fetchClassroom = () => {
    if (!params.id) return
    fetch(`/api/teacher/classes/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setClassroom(data); setLoading(false) })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchClassroom() }, [params.id])

  useEffect(() => {
    if (params.id) setDisplayNames(getNames(params.id as string))
  }, [params.id])

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

  const handleAddStudents = async () => {
    if (!classroom || addLoading) return
    setAddLoading(true)
    try {
      const res = await fetch(`/api/teacher/classes/${classroom.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: addCount }),
      })
      const data = await res.json() as { created: Array<{ userId: string; name: string; password: string }> }
      setNewStudents(data.created)
      fetchClassroom()
    } finally {
      setAddLoading(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!classroom) return
    setResettingId(userId)
    try {
      const res = await fetch(
        `/api/teacher/classes/${classroom.id}/students/${userId}/reset-password`,
        { method: 'POST' }
      )
      const data = await res.json() as { password: string }
      // Update both the newly-created list (if present) and the general reveal map
      setNewStudents((prev) =>
        prev.map((s) => (s.userId === userId ? { ...s, password: data.password } : s))
      )
      setPasswordReveal((prev) => ({ ...prev, [userId]: data.password }))
    } finally {
      setResettingId(null)
    }
  }

  const handleSaveDisplayName = (userId: string, displayName: string) => {
    if (!classroom) return
    setName(classroom.id, userId, displayName)
    setDisplayNames((prev) => ({ ...prev, [userId]: displayName }))
    setNameEditing(null)
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

      {/* Add students */}
      <div className="kq-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-sky" />
          <h2 className="font-display text-ink">Add Students</h2>
        </div>
        <p className="text-sm font-body text-ink-muted -mt-2">
          Create student accounts directly — no Google account needed. You&apos;ll receive a username and temporary password for each student.
        </p>
        <div className="flex items-center gap-3">
          <label className="text-sm font-body text-ink-muted shrink-0">Create</label>
          <input
            type="number"
            min={1}
            max={50}
            value={addCount}
            onChange={(e) => setAddCount(Math.max(1, Math.min(50, Number(e.target.value))))}
            className="w-20 px-3 py-1.5 rounded-xl border-2 border-ink/20 bg-paper text-ink font-body text-sm focus:outline-none focus:border-sky"
          />
          <label className="text-sm font-body text-ink-muted shrink-0">student{addCount !== 1 ? 's' : ''}</label>
          <button
            onClick={handleAddStudents}
            disabled={addLoading}
            className="kq-btn bg-sky text-white flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {addLoading ? 'Creating…' : 'Create'}
          </button>
        </div>

        {newStudents.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-body text-ink-muted uppercase tracking-wide">New accounts — save these passwords now</p>
            {newStudents.map((s) => (
              <div key={s.userId} className="flex items-center justify-between bg-paper-dark rounded-xl px-4 py-3 border-2 border-ink/10">
                <div>
                  <p className="text-sm font-semibold text-ink">{s.name}</p>
                  {nameEditing === s.userId ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const val = (e.currentTarget.elements.namedItem('dn') as HTMLInputElement).value.trim()
                        if (val) handleSaveDisplayName(s.userId, val)
                      }}
                      className="flex items-center gap-2 mt-1"
                    >
                      <input
                        name="dn"
                        defaultValue={displayNames[s.userId] ?? ''}
                        placeholder="Student's real name (local only)"
                        className="px-2 py-1 rounded-lg border border-ink/20 bg-paper text-ink text-xs font-body focus:outline-none focus:border-sky"
                        autoFocus
                      />
                      <button type="submit" className="text-xs text-mint font-body">Save</button>
                      <button type="button" onClick={() => setNameEditing(null)} className="text-xs text-ink-muted font-body">Cancel</button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setNameEditing(s.userId)}
                      className="text-xs text-ink-muted font-body hover:text-ink transition-colors mt-0.5"
                    >
                      {displayNames[s.userId] ? `Display: ${displayNames[s.userId]}` : '+ Add display name (saved locally)'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-ink-muted font-body">Password</p>
                    <p className="font-mono text-sm font-bold text-ink tracking-widest">{s.password}</p>
                  </div>
                  <button
                    onClick={() => handleResetPassword(s.userId)}
                    title="Generate new password"
                    className="text-ink-muted hover:text-coral transition-colors"
                    aria-label="Reset password"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="kq-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-ink">Students</h2>
          <div className="flex items-center gap-2">
            <a
              href={`/api/teacher/classes/${classroom.id}/roster-template`}
              className="kq-btn bg-paper-dark text-ink flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Roster CSV
            </a>
            <Link
              href={`/teacher/classes/${classroom.id}/login-cards`}
              className="kq-btn bg-ink text-paper flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print login cards
            </Link>
          </div>
        </div>
        <StudentTable students={students} classroomId={classroom.id} />
      </div>

      {/* Student logins — password reset for credential-based students */}
      {students.length > 0 && (
        <div className="kq-card p-5 space-y-3">
          <div>
            <h2 className="font-display text-ink">Student Logins</h2>
            <p className="text-sm font-body text-ink-muted mt-1">
              Reset a student&apos;s password if they&apos;ve forgotten it. The new password appears here once — note it down before navigating away.
            </p>
          </div>
          <div className="space-y-1">
            {classroom.members.map((m) => {
              const revealed = passwordReveal[m.userId]
              return (
                <div key={m.userId} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-paper-dark transition-colors">
                  <span className="text-sm font-body text-ink">{m.user.name ?? 'Student'}</span>
                  <div className="flex items-center gap-3">
                    {revealed && (
                      <span className="font-mono text-sm font-bold text-ink tracking-widest bg-sunny/30 px-2 py-0.5 rounded-lg">
                        {revealed}
                      </span>
                    )}
                    <button
                      onClick={() => handleResetPassword(m.userId)}
                      disabled={resettingId === m.userId}
                      className="kq-btn bg-paper-dark text-ink flex items-center gap-1.5 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {resettingId === m.userId ? 'Resetting…' : revealed ? 'Reset again' : 'Reset password'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
