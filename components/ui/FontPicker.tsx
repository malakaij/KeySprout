'use client'

import { useState } from 'react'
import { Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDyslexiaFont, FONT_OPTIONS, type DyslexiaFont } from '@/hooks/useDyslexiaFont'

const SAMPLE = 'The quick fox jumps.'

export function FontPicker() {
  const { font, setFont } = useDyslexiaFont()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="font-picker-list"
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-paper-dark transition-colors text-xs font-semibold font-body"
      >
        <Type className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Reading Font</span>
        <span className="ml-auto text-ink-muted">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <fieldset
          id="font-picker-list"
          className="mt-2 space-y-1 px-1"
          aria-label="Choose a reading font"
        >
          <legend className="sr-only">Reading font preference</legend>
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
        </fieldset>
      )}
    </div>
  )
}
