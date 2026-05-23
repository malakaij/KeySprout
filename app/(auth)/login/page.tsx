'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Chrome } from 'lucide-react'
import { Pip } from '@/components/ui/Pip'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Pip size="lg" variant="wave" />
          </div>
          <h1 className="text-2xl font-display text-ink">Welcome to KeySprout</h1>
          <p className="text-ink-muted mt-2 text-sm font-body">Sign in to start your typing journey</p>
        </div>

        <div className="kq-card p-8">
          <h2 className="text-lg font-display text-ink mb-6 text-center">Sign In</h2>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full kq-btn bg-white text-ink flex items-center justify-center gap-3 px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5 text-sky" />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-ink-muted font-body">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-ink-muted font-body">
          <p>Free forever. No credit card required.</p>
        </div>
      </div>
    </div>
  )
}
