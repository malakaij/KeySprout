'use client'

const LEFT_KEYS = new Set(['q','w','e','r','t','a','s','d','f','g','z','x','c','v','b'])
const RIGHT_KEYS = new Set(['y','u','i','o','p','h','j','k','l','n','m'])

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
]

interface KeyboardHintProps {
  /** Character to highlight on the layout. Pass an empty string or omit to show the guide with no target. */
  nextKey?: string
}

export function KeyboardHint({ nextKey }: KeyboardHintProps) {
  const target = nextKey?.toLowerCase() ?? ''

  return (
    <div className="select-none" aria-label="Keyboard hint">
      <p className="text-xs text-ink/50 font-body text-center mb-2">
        {target ? (
          <>Next key: <span className="font-mono font-bold text-ink">{nextKey?.toUpperCase()}</span></>
        ) : 'Keyboard guide'}
      </p>
      <div className="inline-flex flex-col items-center gap-1 mx-auto">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1" style={{ paddingLeft: ri === 1 ? '0.75rem' : ri === 2 ? '1.5rem' : 0 }}>
            {row.map((k) => {
              const isTarget = k === target
              const isLeft = LEFT_KEYS.has(k)
              const isRight = RIGHT_KEYS.has(k)
              let bg = 'bg-paper-dark border-ink/30 text-ink/50'
              if (isTarget) bg = 'bg-sunny border-ink text-ink shadow-ink-sm animate-pulse-ring'
              else if (isLeft) bg = 'bg-mint/40 border-ink/40 text-ink/70'
              else if (isRight) bg = 'bg-coral/30 border-ink/40 text-ink/70'
              return (
                <div
                  key={k}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-mono font-bold uppercase transition-all ${bg}`}
                >
                  {k}
                </div>
              )
            })}
          </div>
        ))}
        {/* Space bar */}
        <div className="flex gap-1 mt-0.5">
          <div className={`h-7 rounded-lg border-2 flex items-center justify-center text-xs font-mono font-bold transition-all ${target === ' ' ? 'bg-sunny border-ink shadow-ink-sm animate-pulse-ring' : 'bg-paper-dark border-ink/30 text-ink/50'}`} style={{ width: '12rem' }}>
            space
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-ink/40 font-body">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-mint/40 border border-ink/30 inline-block" /> Left hand</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-coral/30 border border-ink/30 inline-block" /> Right hand</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-sunny border border-ink inline-block" /> Next key</span>
      </div>
    </div>
  )
}
