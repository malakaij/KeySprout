'use client'

import { useEffect, useMemo, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function hasPhysicalKeyboard() {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { keyboard?: unknown }
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const noHover = window.matchMedia('(hover: none)').matches

  return Boolean(nav.keyboard) || !(coarsePointer && noHover)
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const keyboardReady = useMemo(hasPhysicalKeyboard, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  if (!keyboardReady || dismissed || !installEvent) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-green-200 bg-white p-4 shadow-xl">
      <p className="text-sm font-semibold text-slate-900">Install KeySprout</p>
      <p className="mt-1 text-sm text-slate-600">Practice typing from your desktop or keyboard-ready device.</p>
      <div className="mt-3 flex gap-2">
        <button
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          onClick={async () => {
            await installEvent.prompt()
            await installEvent.userChoice
            setInstallEvent(null)
          }}
        >
          Install app
        </button>
        <button className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100" onClick={() => setDismissed(true)}>
          Not now
        </button>
      </div>
    </div>
  )
}
