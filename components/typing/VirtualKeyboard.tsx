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

// Left hand = mint tones, right hand = sky/coral tones, by finger
const FINGER_COLORS: Record<string, string> = {
  // Left pinky
  '`': 'bg-grape/20', '1': 'bg-grape/20', a: 'bg-grape/20', q: 'bg-grape/20', z: 'bg-grape/20',
  // Left ring
  '2': 'bg-sky/25', s: 'bg-sky/25', w: 'bg-sky/25', x: 'bg-sky/25',
  // Left middle
  '3': 'bg-mint/25', d: 'bg-mint/25', e: 'bg-mint/25', c: 'bg-mint/25',
  // Left index
  '4': 'bg-mint/40', '5': 'bg-mint/40', f: 'bg-mint/40', r: 'bg-mint/40',
  v: 'bg-mint/40', t: 'bg-mint/40', g: 'bg-mint/40', b: 'bg-mint/40',
  // Right index
  '6': 'bg-coral/25', '7': 'bg-coral/25', j: 'bg-coral/25', u: 'bg-coral/25',
  m: 'bg-coral/25', y: 'bg-coral/25', h: 'bg-coral/25', n: 'bg-coral/25',
  // Right middle
  '8': 'bg-coral/35', k: 'bg-coral/35', i: 'bg-coral/35', ',': 'bg-coral/35',
  // Right ring
  '9': 'bg-berry/25', l: 'bg-berry/25', o: 'bg-berry/25', '.': 'bg-berry/25',
  // Right pinky
  '0': 'bg-berry/40', ';': 'bg-berry/40', p: 'bg-berry/40', '/': 'bg-berry/40',
  '-': 'bg-berry/40', "'": 'bg-berry/40', '[': 'bg-berry/40', ']': 'bg-berry/40',
  '=': 'bg-berry/40', '\\': 'bg-berry/40',
}

function getErrorColor(rate: number | undefined): string {
  if (rate === undefined) return ''
  if (rate > 0.5) return 'bg-coral border-coral text-white'
  if (rate > 0.25) return 'bg-coral/60 border-coral/60'
  if (rate > 0.1) return 'bg-sunny/60 border-sunny'
  return 'bg-mint/40 border-mint/60'
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
  const baseFingerColor = fingerColors && errorRate === undefined
    ? (FINGER_COLORS[label.toLowerCase()] ?? 'bg-paper-dark')
    : ''
  const errorColor = errorRate !== undefined ? getErrorColor(errorRate) : ''

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg text-xs font-mono font-medium',
        'min-h-[34px] transition-all duration-75 select-none border-2',
        wide ? 'px-3 flex-1' : 'w-9',
        errorColor || baseFingerColor || 'bg-paper-dark',
        'text-ink border-ink/20',
        highlight && 'ring-2 ring-sunny border-ink scale-110 bg-sunny z-10 text-ink font-bold shadow-ink-sm animate-pulse-ring',
        pressed && 'scale-90 opacity-70'
      )}
    >
      {label}
    </div>
  )
}

export function VirtualKeyboard({ highlightKey, pressedKey, fingerColors = false, errorKeys }: VirtualKeyboardProps) {
  return (
    <div className="bg-paper-dark rounded-2xl border-[3px] border-ink/20 p-4 space-y-1.5 select-none">
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
        <div className="flex-1 max-w-xs bg-paper-dark border-2 border-ink/20 rounded-lg min-h-[34px] flex items-center justify-center text-xs text-ink/40 font-mono">
          space
        </div>
      </div>
    </div>
  )
}
