import { Settings } from 'lucide-react'

/** Placeholder — full implementation lands in Sprint 13 (settings page). */
export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Settings className="w-6 h-6 text-grape" aria-hidden="true" />
        <h1 className="text-2xl font-display text-ink">Settings</h1>
      </div>
      <p className="text-ink-muted font-body">Settings are coming in a future sprint.</p>
    </div>
  )
}
