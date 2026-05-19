'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'

export function JoinClassCard() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/user/join-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(`Request sent to join "${data.classroomName}". Your teacher will approve it shortly.`)
        setCode('')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold text-slate-200">Join a Class</h2>
      </div>
      {status === 'success' ? (
        <p className="text-emerald-400 text-sm">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); setMessage('') }}
            placeholder="Enter class code"
            maxLength={8}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono tracking-wider uppercase"
          />
          <button
            type="submit"
            disabled={status === 'loading' || !code.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? 'Sending...' : 'Request to Join'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{message}</p>
      )}
    </div>
  )
}
