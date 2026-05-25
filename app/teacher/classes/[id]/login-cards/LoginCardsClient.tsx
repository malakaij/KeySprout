'use client'

import { useState } from 'react'
import { AlertTriangle, Printer, ArrowLeft, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import type { StudentRecord } from './page'

interface GeneratedCard {
  userId: string
  name: string
  qrDataUrl: string
}

interface LoginCardsClientProps {
  classroomId: string
  classroomName: string
  students: StudentRecord[]
  baseUrl: string
}

export function LoginCardsClient({
  classroomId,
  classroomName,
  students,
  baseUrl,
}: LoginCardsClientProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(students.map((s) => s.userId)))
  const [generating, setGenerating] = useState(false)
  const [cards, setCards] = useState<GeneratedCard[] | null>(null)
  const [error, setError] = useState('')

  const toggleAll = () => {
    setSelected(selected.size === students.length ? new Set() : new Set(students.map((s) => s.userId)))
  }

  const toggleOne = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) { next.delete(userId) } else { next.add(userId) }
      return next
    })
  }

  const handleGenerate = async () => {
    if (selected.size === 0 || generating) return
    setGenerating(true)
    setError('')
    setCards(null)

    try {
      const results: GeneratedCard[] = []

      for (const student of students.filter((s) => selected.has(s.userId))) {
        const res = await fetch(
          `/api/teacher/classes/${classroomId}/students/${student.userId}/login-token`,
          { method: 'POST' }
        )
        if (!res.ok) throw new Error(`Failed for ${student.name}`)
        const { token } = await res.json() as { token: string }

        const loginUrl = `${baseUrl}/login/token?t=${token}`
        const qrDataUrl = await QRCode.toDataURL(loginUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#1a1a2e', light: '#fef9ef' },
        })

        results.push({ userId: student.userId, name: student.name, qrDataUrl })
      }

      setCards(results)
      // Give the DOM a tick to render before printing
      setTimeout(() => window.print(), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }

  // ── Print view ──────────────────────────────────────────────────────────────
  if (cards) {
    return (
      <div className="bg-white min-h-screen">
        {/* Print-specific styles: black & white, no chrome, clean card grid */}
        <style>{`
          @media print {
            @page { size: A4; margin: 0.6in; }
            body { background: white !important; }
            nav, header, footer { display: none !important; }
            .no-print { display: none !important; }
            .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4in; }
            .login-card {
              border: 1.5px solid #000 !important;
              border-radius: 0 !important;
              break-inside: avoid;
              page-break-inside: avoid;
              color: #000 !important;
              background: white !important;
            }
            .login-card img { filter: grayscale(100%) contrast(150%); }
            * { color: #000 !important; background: transparent !important;
                box-shadow: none !important; }
          }
        `}</style>
        <div className="no-print p-6 flex items-center justify-between border-b-2 border-ink/10">
          <div>
            <h1 className="text-2xl font-display text-ink">Login Cards — {classroomName}</h1>
            <p className="text-sm font-body text-ink-muted mt-1">
              {cards.length} card{cards.length !== 1 ? 's' : ''} generated.
              The old QR codes for these students are now invalid — keep these cards safe.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCards(null)}
              className="kq-btn bg-paper-dark text-ink flex items-center gap-2 px-4 py-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => window.print()}
              className="kq-btn bg-ink text-paper flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Printer className="w-4 h-4" />
              Save as PDF / Print
            </button>
          </div>
        </div>

        <div className="card-grid p-6 grid grid-cols-2 gap-6">
          {cards.map((card) => (
            <div
              key={card.userId}
              className="login-card border-2 border-ink rounded-2xl p-5 flex gap-4 items-start bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.qrDataUrl}
                alt={`QR code for ${card.name}`}
                width={110}
                height={110}
                className="shrink-0 rounded-lg border border-ink/20"
              />
              <div className="min-w-0">
                <p className="text-xs text-ink-muted font-body uppercase tracking-wider mb-1">
                  {classroomName}
                </p>
                <p className="text-xl font-display text-ink leading-tight">{card.name}</p>
                <p className="text-xs font-body text-ink-muted mt-3 leading-relaxed">
                  Scan to sign in, or visit
                </p>
                <p className="text-xs font-mono text-ink font-bold">{baseUrl}/login</p>
                <p className="text-xs font-body text-ink-muted mt-2">
                  Username: <span className="font-semibold text-ink">{card.name}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Selection view ───────────────────────────────────────────────────────────
  const selectedCount = selected.size

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/teacher/classes/${classroomId}`}
          className="text-ink-muted hover:text-ink transition-colors"
          aria-label="Back to class"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display text-ink">Print Login Cards</h1>
          <p className="text-ink-muted text-sm font-body">{classroomName}</p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex gap-3 p-4 rounded-2xl border-2 border-sunny bg-sunny/10">
        <AlertTriangle className="w-5 h-5 text-ink shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink font-body">
            Generating new cards voids the old ones
          </p>
          <p className="text-sm text-ink-muted font-body">
            Each student can only have one active QR code at a time. When you generate a card here,
            any previously printed card for that student stops working immediately.
            Only select students who need a replacement — leave others unchecked to keep their
            existing cards valid.
          </p>
        </div>
      </div>

      {/* Student list */}
      <div className="kq-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-ink">Select students</h2>
          <button
            onClick={toggleAll}
            className="text-xs text-sky font-body hover:underline"
          >
            {selectedCount === students.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        {students.length === 0 && (
          <p className="text-sm text-ink-muted font-body">No approved students in this class yet.</p>
        )}

        <div className="space-y-1">
          {students.map((s) => {
            const checked = selected.has(s.userId)
            return (
              <button
                key={s.userId}
                onClick={() => toggleOne(s.userId)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-paper-dark transition-colors text-left"
              >
                {checked
                  ? <CheckSquare className="w-4 h-4 text-sky shrink-0" />
                  : <Square className="w-4 h-4 text-ink-muted shrink-0" />
                }
                <span className="text-sm font-body text-ink">{s.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className="text-sm text-coral font-body">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={selectedCount === 0 || generating}
        className="kq-btn bg-ink text-paper flex items-center gap-2 px-5 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Printer className="w-4 h-4" />
        {generating
          ? 'Generating…'
          : `Generate & print ${selectedCount > 0 ? `${selectedCount} card${selectedCount !== 1 ? 's' : ''}` : 'cards'}`}
      </button>

      <p className="text-xs text-ink-muted font-body">
        Cards are valid for one year. Students scan the QR code to sign in instantly — no password needed.
      </p>
    </div>
  )
}
