'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound } from 'lucide-react'

export function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <KeyRound className="w-6 h-6 text-coral" />
          <span className="text-xl font-display text-ink">KeySprout Admin</span>
        </div>
        <form onSubmit={handleSubmit} className="kq-card p-6 space-y-4">
          <h1 className="text-lg font-display text-ink">Sign in</h1>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-paper-dark border-2 border-ink/30 rounded-xl px-3 py-2 text-ink placeholder-ink/30 focus:outline-none focus:border-ink text-sm font-body"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-paper-dark border-2 border-ink/30 rounded-xl px-3 py-2 text-ink placeholder-ink/30 focus:outline-none focus:border-ink text-sm font-body"
            />
          </div>
          {error && <p className="text-sm text-coral font-body">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full kq-btn bg-coral text-white py-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
