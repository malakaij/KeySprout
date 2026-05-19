'use client'

import { useState, useEffect } from 'react'
import { ClassCard } from '@/components/teacher/ClassCard'
import { Plus, X } from 'lucide-react'
import type { ClassroomWithMembers } from '@/types'

type ClassroomData = ClassroomWithMembers & { _count?: { members: number } }

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassroomData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchClasses = async () => {
    const res = await fetch('/api/teacher/classes')
    if (res.ok) {
      const data = await res.json()
      setClasses(data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchClasses() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/teacher/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })
      if (res.ok) {
        setName('')
        setDescription('')
        setShowForm(false)
        fetchClasses()
      }
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/teacher/classes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setClasses((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Classes</h1>
          <p className="text-slate-400 mt-1">Create and manage your virtual classrooms.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Class
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-200">Create New Class</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Class Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 5th Period Typing"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description (optional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Fall 2024 Typing Class"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Class'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : classes.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
          <p className="text-slate-400 mb-4">No classes yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Class
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {classes.map((c) => (
            <ClassCard
              key={c.id}
              classroom={c}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
