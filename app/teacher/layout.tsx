'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TeacherSidebar } from '@/components/layout/TeacherSidebar'
import { GraduationCap } from 'lucide-react'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
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
    const handleSwitch = async () => {
      setSwitching(true)
      try {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'TEACHER' }),
        })
        await update({ role: 'TEACHER' })
        router.refresh()
      } finally {
        setSwitching(false)
      }
    }

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">Switch to Teacher Mode?</h1>
          <p className="text-slate-400 text-sm">
            This lets you create classes and track student progress. You can switch back anytime.
          </p>
          <button
            onClick={handleSwitch}
            disabled={switching}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {switching ? 'Switching...' : 'Enable Teacher Mode'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            Stay as Student
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
