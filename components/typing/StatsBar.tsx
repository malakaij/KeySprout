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
      <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
        <div className="p-2 bg-emerald-900/50 rounded-lg">
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">WPM</p>
          <p className="text-lg font-bold text-emerald-400">{wpm}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
        <div className="p-2 bg-blue-900/50 rounded-lg">
          <Target className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Accuracy</p>
          <p className="text-lg font-bold text-blue-400">{Math.round(accuracy * 100)}%</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
        <div className="p-2 bg-amber-900/50 rounded-lg">
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Time</p>
          <p className="text-lg font-bold text-amber-400">{timeStr}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-3">
        <div className="p-2 bg-red-900/50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Errors</p>
          <p className="text-lg font-bold text-red-400">{errors}</p>
        </div>
      </div>
    </div>
  )
}
