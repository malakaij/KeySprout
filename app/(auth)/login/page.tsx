'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Chrome, LogIn } from 'lucide-react'
import { Pip } from '@/components/ui/Pip'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [credLoading, setCredLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [credError, setCredError] = useState('')
  const [showCredForm, setShowCredForm] = useState(false)

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setCredLoading(true)
    setCredError('')
    const result = await signIn('credentials', {
      username: username.trim(),
      password,
      redirect: false,
    })
    setCredLoading(false)
    if (result?.error) {
      setCredError('Incorrect username or password.')
    } else {
      const next = searchParams.get('callbackUrl') ?? '/dashboard'
      window.location.href = next
    }
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

        <div className="kq-card p-8 space-y-4">
          <h2 className="text-lg font-display text-ink mb-2 text-center">Sign In</h2>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full kq-btn bg-white text-ink flex items-center justify-center gap-3 px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5 text-sky" />
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ink/10" />
            <span className="text-xs text-ink-muted font-body">or</span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>

          {!showCredForm ? (
            <button
              onClick={() => setShowCredForm(true)}
              className="w-full kq-btn bg-paper-dark text-ink flex items-center justify-center gap-3 px-4 py-3"
            >
              <LogIn className="w-5 h-5" />
              Sign in with username
            </button>
          ) : (
            <form onSubmit={handleCredentialsSignIn} className="space-y-3">
              <div>
                <label htmlFor="username" className="block text-xs text-ink-muted font-body mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Brave Cat"
                  className="w-full px-3 py-2 rounded-xl border-2 border-ink/20 bg-paper text-ink font-body text-sm focus:outline-none focus:border-sky"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs text-ink-muted font-body mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border-2 border-ink/20 bg-paper text-ink font-body text-sm focus:outline-none focus:border-sky"
                />
              </div>
              {credError && <p className="text-xs text-coral font-body">{credError}</p>}
              <button
                type="submit"
                disabled={credLoading || !username.trim() || !password.trim()}
                className="w-full kq-btn bg-sky text-white flex items-center justify-center gap-2 px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-4 h-4" />
                {credLoading ? 'Signing in...' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCredForm(false); setCredError('') }}
                className="w-full text-xs text-ink-muted font-body hover:text-ink transition-colors"
              >
                Back
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
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
