import { Compass } from 'lucide-react'

/** Placeholder — full implementation lands in Sprint 10 (Epic #117 courses data model). */
export default function CoursesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Compass className="w-6 h-6 text-berry" aria-hidden="true" />
        <h1 className="text-2xl font-display text-ink">Your Courses</h1>
      </div>
      <p className="text-ink-muted font-body">Courses are coming in the next sprint.</p>
    </div>
  )
}
