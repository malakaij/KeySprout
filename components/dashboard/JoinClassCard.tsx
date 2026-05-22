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
    <div className="kq-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-sky" />
        <h2 className="font-display text-ink">Join a Class</h2>
      </div>
      {status === 'success' ? (
        <p className="text-mint text-sm font-body">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); setMessage('') }}
            placeholder="Enter class code"
            maxLength={8}
            className="flex-1 bg-paper-dark border-2 border-ink/30 rounded-xl px-3 py-2 text-ink placeholder-ink/30 focus:outline-none focus:border-ink text-sm font-mono tracking-wider uppercase font-body"
          />
          <button
            type="submit"
            disabled={status === 'loading' || !code.trim()}
            className="kq-btn bg-sky text-white px-4 py-2 text-sm disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? 'Sending...' : 'Request to Join'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-coral text-xs mt-2 font-body">{message}</p>
      )}
    </div>
  )
}
