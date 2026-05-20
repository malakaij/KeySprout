import { Zap, Target, Clock, AlertCircle } from 'lucide-react'

interface StatsBarProps {
  wpm: number
  accuracy: number
  timeElapsed: number
  errors: number
}

export function StatsBar({ wpm, accuracy, timeElapsed, errors }: StatsBarProps) {
  const minutes = Math.floor(timeElapsed / 60)
  const seconds = timeElapsed % 60
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="bg-white rounded-xl border-2 border-ink/10 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-mint/20 rounded-lg">
          <Zap className="w-4 h-4 text-mint" />
        </div>
        <div>
          <p className="text-xs text-ink/40 font-body">WPM</p>
          <p className="text-lg font-display text-mint">{wpm}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-ink/10 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-sky/20 rounded-lg">
          <Target className="w-4 h-4 text-sky" />
        </div>
        <div>
          <p className="text-xs text-ink/40 font-body">Accuracy</p>
          <p className="text-lg font-display text-sky">{Math.round(accuracy * 100)}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-ink/10 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-sunny/20 rounded-lg">
          <Clock className="w-4 h-4 text-sunny" />
        </div>
        <div>
          <p className="text-xs text-ink/40 font-body">Time</p>
          <p className="text-lg font-display text-ink">{timeStr}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-ink/10 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-coral/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-coral" />
        </div>
        <div>
          <p className="text-xs text-ink/40 font-body">Errors</p>
          <p className="text-lg font-display text-coral">{errors}</p>
        </div>
      </div>
    </div>
  )
}
