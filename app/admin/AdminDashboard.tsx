'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Users, BookOpen, CheckCircle, AlertCircle, RefreshCw, LogOut, Zap } from 'lucide-react'

interface Props {
  isSeeded: boolean
  stats: { courses: number; lessons: number; users: number; attempts: number }
}

export function AdminDashboard({ isSeeded, stats }: Props) {
  const router = useRouter()
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSeed = async () => {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' })
      const data = await res.json()
      setSeedResult({ ok: res.ok, message: data.message ?? data.error ?? 'Unknown result' })
      if (res.ok) router.refresh()
    } catch {
      setSeedResult({ ok: false, message: 'Request failed — check server logs.' })
    } finally {
      setSeeding(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-coral" />
            <h1 className="text-xl font-display text-ink">KeySprout Super-Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="kq-btn bg-paper-dark text-ink flex items-center gap-1.5 px-3 py-1.5 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Courses', value: stats.courses, icon: <BookOpen className="w-4 h-4 text-mint" /> },
            { label: 'Lessons', value: stats.lessons, icon: <Database className="w-4 h-4 text-sky" /> },
            { label: 'Users', value: stats.users, icon: <Users className="w-4 h-4 text-sunny" /> },
            { label: 'Attempts', value: stats.attempts, icon: <Zap className="w-4 h-4 text-grape" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="kq-card p-4">
              <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-ink-muted font-body">{label}</span></div>
              <p className="text-2xl font-display text-ink">{value}</p>
            </div>
          ))}
        </div>

        {/* Seed Panel */}
        <div className="kq-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-ink">Database Seed</h2>
            {isSeeded ? (
              <span className="flex items-center gap-1.5 text-mint text-sm font-semibold font-body">
                <CheckCircle className="w-4 h-4" /> Seeded
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-coral text-sm font-semibold font-body">
                <AlertCircle className="w-4 h-4" /> Not seeded
              </span>
            )}
          </div>

          <p className="text-sm text-ink-muted font-body">
            {isSeeded
              ? `The database already contains ${stats.courses} course(s) and ${stats.lessons} lesson(s). Re-seeding will wipe all lesson data and lesson attempt history.`
              : 'No courses or lessons found. Run the seed to populate the database with the full 250-lesson curriculum.'}
          </p>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className={`kq-btn flex items-center gap-2 px-4 py-2 text-sm ${
              isSeeded
                ? 'bg-paper-dark text-ink'
                : 'bg-mint text-ink'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding…' : isSeeded ? 'Re-seed database' : 'Seed database'}
          </button>

          {seedResult && (
            <p className={`text-sm font-body ${seedResult.ok ? 'text-mint' : 'text-coral'}`}>
              {seedResult.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
