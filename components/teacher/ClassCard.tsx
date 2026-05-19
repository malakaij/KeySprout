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
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-100 text-lg">{classroom.name}</h3>
          {classroom.description && (
            <p className="text-sm text-slate-400 mt-0.5">{classroom.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-slate-500 hover:text-red-400 transition-colors p-1"
          title={showConfirm ? 'Click again to confirm' : 'Delete class'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400">Class Code:</span>
        <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-1.5">
          <span className="font-mono font-bold text-amber-400 tracking-widest text-sm">
            {classroom.code}
          </span>
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
          <Users className="w-4 h-4" />
          <span>{memberCount} student{memberCount !== 1 ? 's' : ''}</span>
        </div>

        <Link
          href={`/teacher/classes/${classroom.id}`}
          className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          View Class
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {showConfirm && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
          Are you sure? Click the trash icon again to confirm deletion.
        </div>
      )}
    </div>
  )
}
