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
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-100">KeySprout Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Courses', value: stats.courses, icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
            { label: 'Lessons', value: stats.lessons, icon: <Database className="w-4 h-4 text-blue-400" /> },
            { label: 'Users', value: stats.users, icon: <Users className="w-4 h-4 text-amber-400" /> },
            { label: 'Attempts', value: stats.attempts, icon: <Zap className="w-4 h-4 text-purple-400" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-slate-400">{label}</span></div>
              <p className="text-2xl font-bold text-slate-100">{value}</p>
            </div>
          ))}
        </div>

        {/* Seed Panel */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-200">Database Seed</h2>
            {isSeeded ? (
              <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4" /> Seeded
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4" /> Not seeded
              </span>
            )}
          </div>

          <p className="text-sm text-slate-400">
            {isSeeded
              ? `The database already contains ${stats.courses} course(s) and ${stats.lessons} lesson(s). Re-seeding will wipe all lesson data and lesson attempt history.`
              : 'No courses or lessons found. Run the seed to populate the database with the full 250-lesson curriculum.'}
          </p>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isSeeded
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding…' : isSeeded ? 'Re-seed database' : 'Seed database'}
          </button>

          {seedResult && (
            <p className={`text-sm ${seedResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {seedResult.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
