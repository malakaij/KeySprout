'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Pip } from '@/components/ui/Pip'

/** Auto-signs in via QR token from a printed login card. */
export default function TokenLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true

    const t = searchParams.get('t')
    if (!t) {
      router.replace('/login')
      return
    }

    signIn('credentials', { loginToken: t, redirect: false }).then((result) => {
      if (result?.error) {
        router.replace('/login?error=token')
      } else {
        router.replace('/dashboard')
      }
    })
  }, [searchParams, router])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Pip size="lg" variant="wave" />
        <p className="text-ink font-display text-lg">Signing you in…</p>
      </div>
    </div>
  )
}
