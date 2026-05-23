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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-paper">
        <div className="text-ink-muted font-body">Loading...</div>
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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-paper">
        <div className="max-w-sm w-full kq-card p-8 space-y-5">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-sunny/30 rounded-full border-[3px] border-ink flex items-center justify-center mx-auto shadow-ink-sm">
              <GraduationCap className="w-8 h-8 text-ink" />
            </div>
            <h1 className="text-xl font-display text-ink">Teacher Access</h1>
            <p className="text-ink-muted text-sm font-body">
              Enter the access code provided by your school administrator to enable teacher mode.
            </p>
          </div>

          <form onSubmit={handleSwitch} className="space-y-3">
            <input
              type="password"
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value); setError('') }}
              placeholder="Access code"
              aria-label="Teacher access code"
              required
              className="w-full bg-paper-dark border-2 border-ink/30 rounded-xl px-3 py-2.5 text-ink placeholder-ink/30 focus:outline-hidden focus:border-ink text-sm font-body"
            />
            {error && (
              <p className="text-coral text-xs font-body">{error}</p>
            )}
            <button
              type="submit"
              disabled={switching || !accessCode.trim()}
              className="w-full kq-btn bg-mint text-ink px-4 py-3 font-display disabled:opacity-50"
            >
              {switching ? 'Verifying...' : 'Enable Teacher Mode'}
            </button>
          </form>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 text-ink-muted hover:text-ink text-sm transition-colors text-center font-body"
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
      <main id="main-content" className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
