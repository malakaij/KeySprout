import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function ProgressLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-8 w-36" />

      {/* WPM / accuracy chart */}
      <SkeletonCard>
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </SkeletonCard>

      {/* Section progress bars */}
      <SkeletonCard>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      {/* Weak keys */}
      <SkeletonCard>
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-10 rounded-lg" />
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
