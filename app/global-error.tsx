'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// global-error replaces the root layout when it fires, so it must include
// <html> and <body> tags and cannot rely on any layout components.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
    logger.error({ digest: error.digest }, 'unhandled global error')
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#fff6e3', fontFamily: 'sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}>
          {/* Inline SVG so this page has zero external dependencies */}
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Pip mascot" style={{ marginBottom: '24px' }}>
            <ellipse cx="50" cy="56" rx="38" ry="36" fill="#9b5de5" stroke="#1a1a2e" strokeWidth="3" />
            <ellipse cx="50" cy="62" rx="22" ry="18" fill="#ff7eb6" opacity="0.35" />
            <ellipse cx="18" cy="30" rx="11" ry="14" fill="#9b5de5" stroke="#1a1a2e" strokeWidth="3" />
            <ellipse cx="82" cy="30" rx="11" ry="14" fill="#9b5de5" stroke="#1a1a2e" strokeWidth="3" />
            <circle cx="38" cy="48" r="7" fill="white" stroke="#1a1a2e" strokeWidth="2" />
            <circle cx="62" cy="48" r="7" fill="white" stroke="#1a1a2e" strokeWidth="2" />
            <circle cx="40" cy="49" r="3.5" fill="#1a1a2e" />
            <circle cx="64" cy="49" r="3.5" fill="#1a1a2e" />
            <circle cx="41" cy="47" r="1.2" fill="white" />
            <circle cx="65" cy="47" r="1.2" fill="white" />
            <path d="M 38 68 Q 50 60 62 68" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <ellipse cx="28" cy="60" rx="6" ry="4" fill="#ff7eb6" opacity="0.5" />
            <ellipse cx="72" cy="60" rx="6" ry="4" fill="#ff7eb6" opacity="0.5" />
            <ellipse cx="74" cy="36" rx="4" ry="6" fill="#4ea8de" stroke="#1a1a2e" strokeWidth="1.5" />
          </svg>

          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '12px' }}>
            Something went really wrong
          </h1>
          <p style={{ color: '#1a1a2e99', marginBottom: '32px', maxWidth: '360px' }}>
            Pip couldn&apos;t load the page. Please try refreshing — if it keeps
            happening, contact your administrator.
          </p>

          {process.env.NODE_ENV !== 'production' && (
            <pre style={{
              background: '#f0e8d0',
              border: '3px solid #1a1a2e',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#ff5e5b',
              marginBottom: '24px',
              maxWidth: '480px',
              overflowX: 'auto',
              textAlign: 'left',
            }}>
              {error.message}
            </pre>
          )}

          <button
            onClick={reset}
            style={{
              background: '#ff5e5b',
              color: 'white',
              border: '3px solid #1a1a2e',
              borderRadius: '999px',
              padding: '12px 28px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
