import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function InsightsLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-8 w-40" />

      {/* Class selector */}
      <Skeleton className="h-10 w-56 rounded-xl" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton className="h-6 w-6 mb-3 rounded-full" />
            <Skeleton className="h-7 w-14 mb-1" />
            <Skeleton className="h-4 w-20" />
          </SkeletonCard>
        ))}
      </div>

      {/* Keyboard heatmap */}
      <SkeletonCard>
        <Skeleton className="h-5 w-36 mb-4" />
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

      {/* Student list */}
      <SkeletonCard>
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
