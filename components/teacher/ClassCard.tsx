'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Check, Trash2, Users, ChevronRight } from 'lucide-react'
import type { ClassroomWithMembers } from '@/types'

interface ClassCardProps {
  classroom: ClassroomWithMembers & { _count?: { members: number } }
  onDelete: () => void
}

export function ClassCard({ classroom, onDelete }: ClassCardProps) {
  const [copied, setCopied] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const memberCount = classroom.members?.length ?? classroom._count?.members ?? 0

  const handleCopy = async () => {
    await navigator.clipboard.writeText(classroom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }
    onDelete()
    setShowConfirm(false)
  }

  return (
    <div className="kq-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-ink text-lg">{classroom.name}</h3>
          {classroom.description && (
            <p className="text-sm text-ink/50 mt-0.5 font-body">{classroom.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-ink/30 hover:text-coral transition-colors p-1"
          aria-label={showConfirm ? 'Confirm delete class' : `Delete class ${classroom.name}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-ink/50 font-body">Class Code:</span>
        <div className="flex items-center gap-2 bg-paper-dark rounded-xl border-2 border-ink/30 px-3 py-1.5">
          <span className="font-mono font-bold text-sunny tracking-widest text-sm" style={{ textShadow: '0 1px 0 #1a1a2e' }}>
            {classroom.code}
          </span>
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : `Copy class code ${classroom.code}`}
            className="text-ink/40 hover:text-ink transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-mint" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-ink/50 text-sm font-body">
          <Users className="w-4 h-4" />
          <span>{memberCount} student{memberCount !== 1 ? 's' : ''}</span>
        </div>

        <Link
          href={`/teacher/classes/${classroom.id}`}
          className="flex items-center gap-1 text-sm text-sky font-semibold hover:text-sky/70 transition-colors"
        >
          View Class
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {showConfirm && (
        <div className="mt-3 p-3 bg-coral/10 border-2 border-coral rounded-xl text-sm text-coral font-body">
          Are you sure? Click the trash icon again to confirm deletion.
        </div>
      )}
    </div>
  )
}
