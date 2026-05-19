'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TeacherSidebar } from '@/components/layout/TeacherSidebar'
import { GraduationCap } from 'lucide-react'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [accessCode, setAccessCode] = useState('')
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!session?.user) return null

  if (session.user.role === 'STUDENT') {
    const handleSwitch = async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setSwitching(true)
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'TEACHER', accessCode }),
        })
        if (!res.ok) {
          setError('Incorrect access code. Please check with your school administrator.')
          return
        }
        await update({ role: 'TEACHER' })
        router.refresh()
      } finally {
        setSwitching(false)
      }
    }

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 space-y-5">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Teacher Access</h1>
            <p className="text-slate-400 text-sm">
              Enter the access code provided by your school administrator to enable teacher mode.
            </p>
          </div>

          <form onSubmit={handleSwitch} className="space-y-3">
            <input
              type="password"
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value); setError('') }}
              placeholder="Access code"
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
            />
            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}
            <button
              type="submit"
              disabled={switching || !accessCode.trim()}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {switching ? 'Verifying...' : 'Enable Teacher Mode'}
            </button>
          </form>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors text-center"
          >
            Back to Student Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
