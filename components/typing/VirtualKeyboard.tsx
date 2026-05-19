import { cn } from '@/lib/utils'

interface VirtualKeyboardProps {
  highlightKey?: string
  pressedKey?: string
  fingerColors?: boolean
  errorKeys?: Record<string, number>
}

const ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
]

const FINGER_COLORS: Record<string, string> = {
  // Left pinky
  '`': 'bg-slate-600', '1': 'bg-slate-600', a: 'bg-slate-600', q: 'bg-slate-600',
  z: 'bg-slate-600',
  // Left ring
  '2': 'bg-blue-800', s: 'bg-blue-800', w: 'bg-blue-800', x: 'bg-blue-800',
  // Left middle
  '3': 'bg-purple-800', d: 'bg-purple-800', e: 'bg-purple-800', c: 'bg-purple-800',
  // Left index
  '4': 'bg-indigo-800', '5': 'bg-indigo-800', f: 'bg-indigo-800', r: 'bg-indigo-800',
  v: 'bg-indigo-800', t: 'bg-indigo-800', g: 'bg-indigo-800', b: 'bg-indigo-800',
  // Right index
  '6': 'bg-green-800', '7': 'bg-green-800', j: 'bg-green-800', u: 'bg-green-800',
  m: 'bg-green-800', y: 'bg-green-800', h: 'bg-green-800', n: 'bg-green-800',
  // Right middle
  '8': 'bg-teal-800', k: 'bg-teal-800', i: 'bg-teal-800', ',': 'bg-teal-800',
  // Right ring
  '9': 'bg-cyan-800', l: 'bg-cyan-800', o: 'bg-cyan-800', '.': 'bg-cyan-800',
  // Right pinky
  '0': 'bg-sky-800', ';': 'bg-sky-800', p: 'bg-sky-800', '/': 'bg-sky-800',
  '-': 'bg-sky-800', "'": 'bg-sky-800', '[': 'bg-sky-800', ']': 'bg-sky-800',
  '=': 'bg-sky-800', '\\': 'bg-sky-800',
}

function getErrorColor(rate: number | undefined): string {
  if (rate === undefined) return ''
  if (rate > 0.5) return 'bg-red-700'
  if (rate > 0.25) return 'bg-orange-700'
  if (rate > 0.1) return 'bg-yellow-700'
  return 'bg-green-800'
}

interface KeyProps {
  label: string
  highlight?: boolean
  pressed?: boolean
  fingerColors?: boolean
  errorRate?: number
  wide?: boolean
}

function Key({ label, highlight, pressed, fingerColors, errorRate, wide }: KeyProps) {
  const baseFingerColor = fingerColors && !errorRate ? (FINGER_COLORS[label.toLowerCase()] ?? 'bg-slate-700') : ''
  const errorColor = errorRate !== undefined ? getErrorColor(errorRate) : ''

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-md text-xs font-mono font-medium',
        'min-h-[36px] transition-all duration-75 select-none',
        wide ? 'px-3 flex-1' : 'w-9',
        baseFingerColor || errorColor || 'bg-slate-700',
        'text-slate-200 border border-slate-600',
        highlight && 'ring-2 ring-amber-400 scale-110 bg-amber-500/20 text-amber-300 z-10',
        pressed && 'scale-90 brightness-150'
      )}
    >
      {label}
    </div>
  )
}

export function VirtualKeyboard({ highlightKey, pressedKey, fingerColors = false, errorKeys }: VirtualKeyboardProps) {
  return (
    <div className="bg-slate-900 rounded-xl p-4 space-y-1.5 select-none">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-1 justify-center">
          {rowIdx === 1 && <div className="w-6" />}
          {rowIdx === 2 && <div className="w-9" />}
          {rowIdx === 3 && <div className="w-14" />}
          {row.map((key) => (
            <Key
              key={key}
              label={key}
              highlight={highlightKey?.toLowerCase() === key.toLowerCase()}
              pressed={pressedKey?.toLowerCase() === key.toLowerCase()}
              fingerColors={fingerColors}
              errorRate={errorKeys?.[key.toLowerCase()]}
            />
          ))}
          {rowIdx === 1 && <div className="w-6" />}
          {rowIdx === 2 && <div className="w-9" />}
        </div>
      ))}
      <div className="flex gap-1 justify-center">
        <div className="flex-1 max-w-xs bg-slate-700 border border-slate-600 rounded-md min-h-[36px] flex items-center justify-center text-xs text-slate-400 font-mono">
          space
        </div>
      </div>
    </div>
  )
}
