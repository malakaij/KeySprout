'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Pip } from '@/components/ui/Pip'
import { logger } from '@/lib/logger'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // digest is a stable server-side hash safe to log; the message is only
    // shown in the UI in development, never sent to a log aggregator.
    logger.error({ digest: error.digest }, 'unhandled route error')
  }, [error])

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Pip size="lg" variant="worried" />
        </div>

        <h1 className="text-3xl font-display text-ink mb-3">
          Something went sideways!
        </h1>
        <p className="text-ink-muted font-body mb-8">
          Pip ran into an unexpected problem. It&apos;s not your fault — try again
          or head back home.
        </p>

        {/* Show error detail only in development */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="kq-card p-4 mb-6 text-left">
            <p className="text-xs font-mono text-coral break-all">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-ink-muted font-mono mt-1">digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="kq-btn bg-coral text-white px-6 py-3 font-display">
            Try again
          </button>
          <Link href="/" className="kq-btn bg-paper-dark text-ink px-6 py-3 font-display">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
