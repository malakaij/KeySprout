import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function StudentDetailLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back link + student header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-40" />
      </div>

      {/* Student info card */}
      <SkeletonCard>
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </SkeletonCard>

      {/* WPM chart */}
      <SkeletonCard>
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </SkeletonCard>

      {/* Keyboard heatmap */}
      <SkeletonCard>
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="space-y-2">
          {[10, 9, 7].map((count, row) => (
            <div key={row} className="flex gap-1.5 justify-center">
              {Array.from({ length: count }).map((_, k) => (
                <Skeleton key={k} className="h-9 w-9 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Lesson stats table */}
      <SkeletonCard>
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-14 ml-auto" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
