import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton'

export default function LessonsLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <Skeleton className="h-8 w-32" />

      {/* Two section groups */}
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s} className="space-y-3">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-16 ml-auto rounded-full" />
          </div>

          {/* Lesson cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, l) => (
              <SkeletonCard key={l}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
