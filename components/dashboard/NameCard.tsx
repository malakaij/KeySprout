'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shuffle, Clock } from 'lucide-react'

interface NameCardProps {
  currentName: string
  rerollsRemaining: number
  /** Whether the student has already submitted a pending name-change request. Used as initial local state. */
  nameChangeRequested: boolean
  /** When true, name changes are routed through the teacher rather than applied immediately. */
  isInClass: boolean
}

export function NameCard({
  currentName,
  rerollsRemaining,
  nameChangeRequested: initialRequested,
  isInClass,
}: NameCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requested, setRequested] = useState(initialRequested)
  const [remaining, setRemaining] = useState(rerollsRemaining)

  const handleReroll = async () => {
    if (remaining <= 0 || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/user/reroll-name', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }
      setRemaining(data.rerollsRemaining)
      if (data.requested) {
        setRequested(true)
      } else {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="kq-card p-5">
      <div className="flex items-center gap-4 mb-4">
        <div
          style={{
            width: 56, height: 56, borderRadius: 9999,
            background: 'var(--color-grape)',
            border: '3px solid #1a1a2e',
            boxShadow: '3px 3px 0 #1a1a2e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24, color: 'white', lineHeight: 1 }}>
            {currentName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-xs text-ink-muted uppercase tracking-wider font-body">Your username</p>
          <p className="text-2xl font-display text-ink">{currentName}</p>
        </div>
      </div>

      {requested ? (
        <div className="flex items-center gap-2 text-sunny text-sm font-body">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Name change requested — your teacher will assign a new one soon.</span>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleReroll}
            disabled={loading || remaining <= 0}
            className="kq-btn bg-paper-dark text-ink flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4" />
            {isInClass ? 'Request New Username' : 'Reroll Name'}
          </button>
          <p className="text-xs text-ink-muted font-body">
            {remaining > 0
              ? `${remaining} reroll${remaining === 1 ? '' : 's'} remaining today`
              : 'No rerolls remaining today — try again tomorrow'}
          </p>
          {error && <p className="text-xs text-coral font-body">{error}</p>}
        </div>
      )}
      <p className="text-xs text-ink-muted font-body mt-3">
        Need a different name? Your teacher can change it for you.
      </p>
    </div>
  )
}
