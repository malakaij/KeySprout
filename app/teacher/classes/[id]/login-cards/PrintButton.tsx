'use client'

import { Printer } from 'lucide-react'

/** Triggers the browser print dialog. */
export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="kq-btn bg-ink text-paper flex items-center gap-2 px-4 py-2 text-sm"
    >
      <Printer className="w-4 h-4" />
      Print cards
    </button>
  )
}
