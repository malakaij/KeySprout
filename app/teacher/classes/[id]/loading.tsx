import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function ClassDetailLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back link + title */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Join code card */}
      <SkeletonCard>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32" />
      </SkeletonCard>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton className="h-6 w-6 mb-3 rounded-full" />
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-4 w-20" />
          </SkeletonCard>
        ))}
      </div>

      {/* Student table */}
      <SkeletonCard>
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-14 ml-auto" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  )
}
