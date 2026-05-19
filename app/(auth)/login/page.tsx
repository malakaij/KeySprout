'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Chrome } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome to KeySprout</h1>
          <p className="text-slate-400 mt-2 text-sm">Sign in to start your typing journey</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 text-center">Sign In</h2>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Free forever. No credit card required.</p>
        </div>
      </div>
    </div>
  )
}
