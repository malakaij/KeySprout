import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  /** Optional percentage-point change shown as an up/down badge. Positive = improvement. */
  trend?: number
}

export function StatsCard({ label, value, icon, trend }: StatsCardProps) {
  return (
    <div className="kq-card p-5">
      <div className="flex items-start justify-between">
        <div className="p-2 bg-paper-dark rounded-xl border-2 border-ink/20">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border-2',
            trend >= 0
              ? 'bg-mint/20 text-ink border-mint'
              : 'bg-coral/20 text-ink border-coral'
          )}>
            {trend >= 0
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-display text-ink">{value}</p>
        <p className="text-sm text-ink/50 mt-1 font-body">{label}</p>
      </div>
    </div>
  )
}
