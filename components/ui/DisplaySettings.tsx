'use client'

import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDyslexiaFont, FONT_OPTIONS, type DyslexiaFont } from '@/hooks/useDyslexiaFont'
import { useHighContrast } from '@/hooks/useHighContrast'

const SAMPLE = 'The quick fox jumps.'

/** Reading and display preferences panel — font choice and high-contrast toggle. */
export function DisplaySettings() {
  const { font, setFont } = useDyslexiaFont()
  const { highContrast, setHighContrast } = useHighContrast()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="display-settings-panel"
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-paper-dark transition-colors text-xs font-semibold font-body"
      >
        <Settings2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Display Settings</span>
        <span className="ml-auto text-ink-muted" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div id="display-settings-panel" className="mt-2 space-y-4 px-1">

          {/* High contrast toggle */}
          <div>
            <label className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-paper-dark transition-colors">
              <div>
                <p className="text-xs font-semibold text-ink font-body">High contrast</p>
                <p className="text-xs text-ink-muted font-body">White background, stronger text</p>
              </div>
              <button
                role="switch"
                aria-checked={highContrast}
                onClick={() => setHighContrast(!highContrast)}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-ink transition-colors',
                  highContrast ? 'bg-mint' : 'bg-paper-dark'
                )}
              >
                <span className="sr-only">Toggle high contrast</span>
                <span
                  className={cn(
                    'pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-ink shadow transition-transform mt-[1px]',
                    highContrast ? 'translate-x-4' : 'translate-x-0.5'
                  )}
                />
              </button>
            </label>
          </div>

          {/* Font picker */}
          <fieldset aria-label="Reading font preference">
            <legend className="text-xs font-semibold text-ink font-body px-2 mb-1">Reading font</legend>
            <div className="space-y-1">
              {FONT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex flex-col gap-0.5 px-3 py-2 rounded-xl cursor-pointer transition-colors',
                    font === option.value
                      ? 'bg-sunny/30 border-2 border-sunny'
                      : 'hover:bg-paper-dark border-2 border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="kq-font"
                      value={option.value}
                      checked={font === option.value}
                      onChange={() => setFont(option.value as DyslexiaFont)}
                      className="accent-ink w-3 h-3 shrink-0"
                    />
                    <span className="text-xs font-semibold text-ink font-body">{option.label}</span>
                  </div>
                  <span
                    className="text-xs text-ink-muted pl-5"
                    style={{ fontFamily: option.stack }}
                  >
                    {SAMPLE}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

        </div>
      )}
    </div>
  )
}
