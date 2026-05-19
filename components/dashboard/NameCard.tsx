'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shuffle, Clock } from 'lucide-react'

interface NameCardProps {
  currentName: string
  rerollsRemaining: number
  nameChangeRequested: boolean
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
        // Name changed — refresh server component so the new name appears everywhere.
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your username</p>
      <p className="text-2xl font-bold text-slate-100 mb-4">{currentName}</p>

      {requested ? (
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Name change requested — your teacher will assign a new one soon.</span>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleReroll}
            disabled={loading || remaining <= 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4" />
            {isInClass ? 'Request New Username' : 'Reroll Name'}
          </button>
          <p className="text-xs text-slate-500">
            {remaining > 0
              ? `${remaining} reroll${remaining === 1 ? '' : 's'} remaining today`
              : 'No rerolls remaining today — try again tomorrow'}
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}
