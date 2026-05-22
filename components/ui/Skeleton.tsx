import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/** Animated shimmer placeholder. Compose multiples to match the target layout. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-paper-dark border-2 border-ink/10', className)} />
  )
}

/** Mimics a kq-card shell with shimmer content inside. */
export function SkeletonCard({ className, children }: SkeletonProps & { children?: React.ReactNode }) {
  return (
    <div className={cn('kq-card p-5', className)}>
      {children ?? <Skeleton className="h-20" />}
    </div>
  )
}
