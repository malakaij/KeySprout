'use client'

import { useEffect, useRef, useState } from 'react'
import { Keyboard } from 'lucide-react'
import { Pip } from '@/components/ui/Pip'
import {
  looksLikeNoKeyboard,
  getKeyboardOverride,
  setKeyboardOverride,
} from '@/lib/keyboard-detection'

type Status = 'checking' | 'ok' | 'warn'

interface KeyboardGuardProps {
  children: React.ReactNode
}

/**
 * Blocks lesson and game content on touch-only devices until a physical keyboard
 * is confirmed — either by a trusted keydown event or by the user clicking the
 * override button.  Renders nothing while the initial check runs (sub-frame).
 */
export function KeyboardGuard({ children }: KeyboardGuardProps) {
  const [status, setStatus] = useState<Status>('checking')
  const settled = useRef(false)

  const dismiss = (persist: boolean) => {
    if (settled.current) return
    settled.current = true
    if (persist) setKeyboardOverride()
    setStatus('ok')
  }

  useEffect(() => {
    if (getKeyboardOverride() || !looksLikeNoKeyboard()) {
      setStatus('ok')
      return
    }

    setStatus('warn')

    const onKeydown = (e: KeyboardEvent) => {
      // isTrusted is false for synthetic events dispatched by virtual keyboards.
      if (e.isTrusted) dismiss(true)
    }
    window.addEventListener('keydown', onKeydown)
    return () => window.removeEventListener('keydown', onKeydown)
  }, [])

  if (status === 'checking') return null
  if (status === 'ok') return <>{children}</>

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
      role="alert"
      aria-live="polite"
    >
      <Pip size="lg" variant="worried" className="mb-6" />

      <h2 className="text-2xl font-display text-ink mb-2">
        You need a real keyboard!
      </h2>
      <p className="text-ink-muted font-body max-w-sm mb-2">
        KeySprout teaches touch-typing — the skill of typing without looking at your
        keyboard. You&apos;ll need a physical keyboard connected to practice.
      </p>
      <p className="text-ink-muted font-body max-w-sm mb-8 text-sm">
        If you&apos;re on a tablet with a Bluetooth keyboard, just press any key and
        KeySprout will let you through automatically.
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <div className="flex items-center justify-center gap-2 text-sm text-ink-muted font-body">
          <Keyboard className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Press any key once your keyboard is ready.</span>
        </div>

        <button
          onClick={() => dismiss(true)}
          className="kq-btn bg-mint text-ink w-full px-4 py-2.5 text-sm font-semibold"
        >
          I have a keyboard connected
        </button>
      </div>
    </div>
  )
}
