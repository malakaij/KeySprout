'use client'

// Standard QWERTY rows with per-row x-offset for the stagger.
const KEY_W = 30
const KEY_H = 30
const KEY_R = 5
const STEP = KEY_W + 3 // key width + gap

const ROWS: { offset: number; keys: string[] }[] = [
  { offset: 0, keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'] },
  { offset: 12, keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'] },
  { offset: 24, keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm'] },
]

const SVG_W = 10 * STEP - 3 // 327
const ROW_H = KEY_H + 3
const SPACE_Y = 3 * ROW_H + 3
const SPACE_W = 160
const SPACE_X = (SVG_W - SPACE_W) / 2
const SPACE_H = 22
const SVG_H = SPACE_Y + SPACE_H

// Per-finger color using design tokens. Sunny is reserved for the "next key" highlight.
const FINGER_COLOR: Record<0 | 1 | 2 | 3 | 4, string> = {
  1: 'var(--color-mint)',
  2: 'var(--color-sky)',
  3: 'var(--color-grape)',
  4: 'var(--color-coral)',
  0: 'var(--color-paper-dark)', // thumb / space
}

// Finger id: 1=index, 2=middle, 3=ring, 4=pinky, 0=thumb
const FINGER_FOR_KEY: Record<string, { hand: 'left' | 'right' | 'both'; finger: 0 | 1 | 2 | 3 | 4 }> = {
  q: { hand: 'left', finger: 4 }, a: { hand: 'left', finger: 4 }, z: { hand: 'left', finger: 4 },
  w: { hand: 'left', finger: 3 }, s: { hand: 'left', finger: 3 }, x: { hand: 'left', finger: 3 },
  e: { hand: 'left', finger: 2 }, d: { hand: 'left', finger: 2 }, c: { hand: 'left', finger: 2 },
  r: { hand: 'left', finger: 1 }, f: { hand: 'left', finger: 1 }, v: { hand: 'left', finger: 1 },
  t: { hand: 'left', finger: 1 }, g: { hand: 'left', finger: 1 }, b: { hand: 'left', finger: 1 },
  ' ': { hand: 'both', finger: 0 },
  y: { hand: 'right', finger: 1 }, h: { hand: 'right', finger: 1 }, n: { hand: 'right', finger: 1 },
  u: { hand: 'right', finger: 1 }, j: { hand: 'right', finger: 1 }, m: { hand: 'right', finger: 1 },
  i: { hand: 'right', finger: 2 }, k: { hand: 'right', finger: 2 },
  o: { hand: 'right', finger: 3 }, l: { hand: 'right', finger: 3 },
  p: { hand: 'right', finger: 4 },
}

// ——— Hand diagram ———
// Finger rects for the left hand (schematic top-down view, fingers pointing up).
const LEFT_FINGERS: { id: 0 | 1 | 2 | 3 | 4; x: number; y: number; w: number; h: number }[] = [
  { id: 4, x: 4, y: 18, w: 11, h: 28 },  // pinky
  { id: 3, x: 18, y: 8, w: 12, h: 38 },  // ring
  { id: 2, x: 33, y: 2, w: 12, h: 44 },  // middle (tallest)
  { id: 1, x: 48, y: 10, w: 12, h: 36 }, // index
]
// Right hand mirrors left (index finger closest to space bar).
const RIGHT_FINGERS: { id: 0 | 1 | 2 | 3 | 4; x: number; y: number; w: number; h: number }[] = [
  { id: 1, x: 4, y: 10, w: 12, h: 36 },  // index
  { id: 2, x: 19, y: 2, w: 12, h: 44 },  // middle
  { id: 3, x: 34, y: 8, w: 12, h: 38 },  // ring
  { id: 4, x: 49, y: 18, w: 11, h: 28 }, // pinky
]
const HAND_W = 72
const HAND_PALM_Y = 46

interface HandProps {
  side: 'left' | 'right'
  activeFinger: 0 | 1 | 2 | 3 | 4 | null
  /** Whether this hand is typing the next key (affects visual emphasis). */
  active: boolean
}

function Hand({ side, activeFinger, active }: HandProps) {
  const fingers = side === 'left' ? LEFT_FINGERS : RIGHT_FINGERS
  const thumbX = side === 'left' ? 60 : 2
  const thumbRotate = side === 'left' ? 20 : -20
  const thumbAnchorX = side === 'left' ? 65 : 7

  const handStroke = active
    ? 'var(--color-ink)'
    : 'color-mix(in srgb, var(--color-ink) 30%, transparent)'
  const strokeWidth = active ? 1.5 : 1

  function fingerFill(id: 0 | 1 | 2 | 3 | 4) {
    if (id === activeFinger) return 'var(--color-sunny)'
    return `color-mix(in srgb, ${FINGER_COLOR[id]} 55%, var(--color-paper))`
  }

  const thumbFill = fingerFill(0)
  const palmFill = active ? 'var(--color-paper-dark)' : 'var(--color-paper)'

  return (
    <svg width={HAND_W} height={88} viewBox={`0 0 ${HAND_W} 88`} aria-hidden="true">
      <rect x="4" y={HAND_PALM_Y} width="64" height="38" rx="8"
        fill={palmFill} stroke={handStroke} strokeWidth={strokeWidth} />
      {fingers.map(({ id, x, y, w, h }) => (
        <rect key={id} x={x} y={y} width={w} height={h} rx="5"
          fill={fingerFill(id)} stroke={handStroke} strokeWidth={strokeWidth} />
      ))}
      <rect
        x={thumbX} y={56} width={10} height={26} rx={5}
        fill={thumbFill} stroke={handStroke} strokeWidth={strokeWidth}
        transform={`rotate(${thumbRotate}, ${thumbAnchorX}, 56)`}
      />
    </svg>
  )
}

interface KeyboardHintProps {
  /** Character to highlight on the layout. Pass an empty string or omit to show the guide with no target. */
  nextKey?: string
}

export function KeyboardHint({ nextKey }: KeyboardHintProps) {
  const target = nextKey?.toLowerCase() ?? ''
  const fingerInfo = FINGER_FOR_KEY[target] ?? null

  const leftActive = fingerInfo?.hand === 'left' || fingerInfo?.hand === 'both'
  const rightActive = fingerInfo?.hand === 'right' || fingerInfo?.hand === 'both'
  const leftFinger = leftActive ? (fingerInfo?.finger ?? null) : null
  const rightFinger = rightActive ? (fingerInfo?.finger ?? null) : null

  return (
    <div className="select-none w-full" aria-label="Keyboard hint">
      <p className="text-xs text-ink-muted font-body text-center mb-3">
        {target
          ? (<>Next key: <span className="font-mono font-bold text-ink">{nextKey?.toUpperCase()}</span></>)
          : 'Keyboard guide'}
      </p>

      {/* SVG keyboard */}
      <div className="flex justify-center overflow-x-auto">
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          aria-hidden="true"
          style={{ maxWidth: '100%' }}
        >
          {ROWS.map(({ offset, keys }, ri) =>
            keys.map((k, ki) => {
              const x = offset + ki * STEP
              const y = ri * ROW_H
              const isTarget = k === target
              const finger = FINGER_FOR_KEY[k]
              const fill = isTarget
                ? 'var(--color-sunny)'
                : FINGER_COLOR[finger?.finger ?? 0]

              return (
                <g key={k}>
                  <rect
                    x={x} y={y} width={KEY_W} height={KEY_H} rx={KEY_R}
                    fill={fill} fillOpacity={isTarget ? 1 : 0.45}
                    stroke="var(--color-ink)"
                    strokeOpacity={isTarget ? 1 : 0.4}
                    strokeWidth={isTarget ? 2 : 1}
                  />
                  <text
                    x={x + KEY_W / 2} y={y + KEY_H / 2 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fontWeight={isTarget ? 700 : 500}
                    fill="var(--color-ink)" fillOpacity={isTarget ? 1 : 0.75}
                    fontFamily="monospace"
                  >
                    {k.toUpperCase()}
                  </text>
                </g>
              )
            })
          )}

          {/* Space bar */}
          <g>
            <rect
              x={SPACE_X} y={SPACE_Y} width={SPACE_W} height={SPACE_H} rx={KEY_R}
              fill={target === ' ' ? 'var(--color-sunny)' : 'var(--color-paper-dark)'}
              fillOpacity={target === ' ' ? 1 : 0.5}
              stroke="var(--color-ink)"
              strokeOpacity={target === ' ' ? 1 : 0.35}
              strokeWidth={target === ' ' ? 2 : 1}
            />
            <text
              x={SVG_W / 2} y={SPACE_Y + SPACE_H / 2 + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={9} fontWeight={target === ' ' ? 700 : 400}
              fill="var(--color-ink)" fillOpacity={target === ' ' ? 1 : 0.6}
              fontFamily="monospace"
            >
              space
            </text>
          </g>
        </svg>
      </div>

      {/* Hand overlay */}
      <div className="flex items-end justify-center gap-8 mt-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-ink-muted font-body">Left</span>
          <Hand side="left" activeFinger={leftFinger} active={leftActive} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-ink-muted font-body">Right</span>
          <Hand side="right" activeFinger={rightFinger} active={rightActive} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 text-xs text-ink-muted font-body flex-wrap">
        {([
          { label: 'Index', color: 'var(--color-mint)' },
          { label: 'Middle', color: 'var(--color-sky)' },
          { label: 'Ring', color: 'var(--color-grape)' },
          { label: 'Pinky', color: 'var(--color-coral)' },
          { label: 'Next key', color: 'var(--color-sunny)', full: true },
        ] as const).map(({ label, color, full }) => (
          <span key={label} className="flex items-center gap-1.5">
            <svg width={12} height={12} aria-hidden="true">
              <rect width={12} height={12} rx={2} fill={color} fillOpacity={full ? 1 : 0.45}
                stroke="var(--color-ink)" strokeOpacity={full ? 1 : 0.4} strokeWidth={1} />
            </svg>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
