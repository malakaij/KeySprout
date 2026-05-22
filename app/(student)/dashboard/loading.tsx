import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Greeting + streak */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton className="h-6 w-6 mb-4 rounded-full" />
            <Skeleton className="h-7 w-16 mb-2" />
            <Skeleton className="h-4 w-24" />
          </SkeletonCard>
        ))}
      </div>

      {/* Quest map + name card */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SkeletonCard>
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-xl" />
              ))}
            </div>
          </SkeletonCard>
        </div>
        <SkeletonCard>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-7 w-32 mb-4" />
          <Skeleton className="h-9 w-36" />
        </SkeletonCard>
      </div>

      {/* Recent activity */}
      <SkeletonCard>
        <Skeleton className="h-5 w-36 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
