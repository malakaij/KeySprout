'use client'

const KEY_TO_FINGER: Record<string, [string, string]> = {
  '`': ['L','pinky'],  '1': ['L','pinky'],  q: ['L','pinky'], a: ['L','pinky'], z: ['L','pinky'],
  '2': ['L','ring'],   w: ['L','ring'],     s: ['L','ring'],  x: ['L','ring'],
  '3': ['L','middle'], e: ['L','middle'],   d: ['L','middle'], c: ['L','middle'],
  '4': ['L','index'],  r: ['L','index'],    f: ['L','index'], v: ['L','index'],
  '5': ['L','index'],  t: ['L','index'],    g: ['L','index'], b: ['L','index'],
  '6': ['R','index'],  y: ['R','index'],    h: ['R','index'], n: ['R','index'],
  '7': ['R','index'],  u: ['R','index'],    j: ['R','index'], m: ['R','index'],
  '8': ['R','middle'], i: ['R','middle'],   k: ['R','middle'], ',': ['R','middle'],
  '9': ['R','ring'],   o: ['R','ring'],     l: ['R','ring'],  '.': ['R','ring'],
  '0': ['R','pinky'],  p: ['R','pinky'],    ';': ['R','pinky'], '/': ['R','pinky'],
  '-': ['R','pinky'], '=': ['R','pinky'], '[': ['R','pinky'], ']': ['R','pinky'], '\\': ['R','pinky'], "'": ['R','pinky'],
  ' ': ['B','thumb'],
}

interface KeyboardHintProps {
  /** Character to highlight on the layout. */
  nextKey?: string
}

export function KeyboardHint({ nextKey }: KeyboardHintProps) {
  const KW = 36, KH = 32, KG = 4
  const LX = 12
  const KSTEP = KW + KG  // 40

  const ROWS = [
    ['`','1','2','3','4','5','6','7','8','9','0','-','='],
    ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
    ['a','s','d','f','g','h','j','k','l',';',"'"],
    ['z','x','c','v','b','n','m',',','.','/'],
  ]
  const ROW_Y = [12, 48, 84, 120]

  const bspW = 64
  const RE = LX + 13 * KSTEP + bspW  // 596
  const tabW = bspW
  const capsW = 64
  const lShiftW = 80

  const ROW_X0 = [
    LX,
    LX + tabW + KG,
    LX + capsW + KG,
    LX + lShiftW + KG,
  ]

  const bspX = ROW_X0[0] + 13 * KSTEP
  const enterX = ROW_X0[2] + 11 * KSTEP
  const enterW = RE - enterX
  const rShiftX = ROW_X0[3] + 10 * KSTEP
  const rShiftW = RE - rShiftX

  const modRowY = 156
  const modH = KH
  const ctrlW = 52, winW = 44, altW = 44, menuW = 44
  const bottomKeys = [
    { id: 'ctrl-l', label: 'ctrl',  w: ctrlW },
    { id: 'win-l',  label: 'win',   w: winW  },
    { id: 'alt-l',  label: 'alt',   w: altW  },
    { id: 'space',  label: 'space', w: 0 },  // calculated below
    { id: 'alt-r',  label: 'alt',   w: altW  },
    { id: 'win-r',  label: 'win',   w: winW  },
    { id: 'menu',   label: 'menu',  w: menuW },
    { id: 'ctrl-r', label: 'ctrl',  w: ctrlW },
  ]
  const fixedW = ctrlW * 2 + winW * 2 + altW * 2 + menuW
  const gaps = (bottomKeys.length - 1) * KG
  const spaceW = (RE - LX) - fixedW - gaps

  let bx = LX
  const bottomPlaced = bottomKeys.map(k => {
    const w = k.id === 'space' ? spaceW : k.w
    const placed = { ...k, x: bx, y: modRowY, h: modH, w }
    bx += w + KG
    return placed
  })
  const SPACE = bottomPlaced.find(k => k.id === 'space')!

  // Key position map
  const keyPos: Record<string, { x: number; y: number; w: number; h: number; cx: number; cy: number }> = {}
  ROWS.forEach((row, ri) => {
    row.forEach((k, ci) => {
      const x = ROW_X0[ri] + ci * KSTEP
      const y = ROW_Y[ri]
      keyPos[k] = { x, y, w: KW, h: KH, cx: x + KW / 2, cy: y + KH / 2 }
    })
  })
  keyPos[' '] = { x: SPACE.x, y: SPACE.y, w: SPACE.w, h: SPACE.h, cx: SPACE.x + SPACE.w / 2, cy: SPACE.y + SPACE.h / 2 }

  // Hand pose
  const HOME_KEY: Record<string, string> = {
    L_pinky: 'a', L_ring: 's', L_middle: 'd', L_index: 'f', L_thumb: ' ',
    R_index: 'j', R_middle: 'k', R_ring: 'l', R_pinky: ';', R_thumb: ' ',
  }

  const m = nextKey ? KEY_TO_FINGER[nextKey.toLowerCase()] : null
  const activeFingers = new Set<string>()
  if (m) {
    if (m[0] === 'B') { activeFingers.add(`L_${m[1]}`); activeFingers.add(`R_${m[1]}`) }
    else activeFingers.add(`${m[0]}_${m[1]}`)
  }

  const palmY = modRowY + KH + 56
  const PALM_L = { cx: (keyPos['d']?.cx ?? 0) + 10, cy: palmY, rx: 72, ry: 30 }
  const PALM_R = { cx: (keyPos['k']?.cx ?? 0) + 10, cy: palmY, rx: 72, ry: 30 }
  const PALM_TOP_L = PALM_L.cy - PALM_L.ry
  const PALM_TOP_R = PALM_R.cy - PALM_R.ry

  const ANCHORS: Record<string, { x: number; y: number }> = {
    L_pinky:  { x: PALM_L.cx - 33, y: PALM_TOP_L + 4 },
    L_ring:   { x: PALM_L.cx - 11, y: PALM_TOP_L },
    L_middle: { x: PALM_L.cx + 11, y: PALM_TOP_L },
    L_index:  { x: PALM_L.cx + 33, y: PALM_TOP_L + 2 },
    L_thumb:  { x: PALM_L.cx + PALM_L.rx - 18, y: PALM_L.cy + 4 },
    R_thumb:  { x: PALM_R.cx - PALM_R.rx + 18, y: PALM_R.cy + 4 },
    R_index:  { x: PALM_R.cx - 33, y: PALM_TOP_R + 2 },
    R_middle: { x: PALM_R.cx - 11, y: PALM_TOP_R },
    R_ring:   { x: PALM_R.cx + 11, y: PALM_TOP_R },
    R_pinky:  { x: PALM_R.cx + 33, y: PALM_TOP_R + 4 },
  }

  const spc = keyPos[' ']
  const SPACE_L = { cx: spc.x + spc.w * 0.4, cy: spc.cy }
  const SPACE_R = { cx: spc.x + spc.w * 0.6, cy: spc.cy }

  function fingertipFor(fid: string) {
    if (fid === 'L_thumb' || fid === 'R_thumb') {
      const rest = fid === 'L_thumb' ? SPACE_L : SPACE_R
      if (activeFingers.has(fid) && nextKey && nextKey !== ' ') return keyPos[nextKey.toLowerCase()] ?? rest
      return rest
    }
    if (activeFingers.has(fid) && nextKey) return keyPos[nextKey.toLowerCase()] ?? keyPos[HOME_KEY[fid]]
    return keyPos[HOME_KEY[fid]]
  }

  const FINGERS = ['L_pinky','L_ring','L_middle','L_index','L_thumb','R_thumb','R_index','R_middle','R_ring','R_pinky']

  const SVG_W = RE + LX  // 608
  const SVG_H = palmY + PALM_L.ry + 12
  const KB_BG_H = modRowY + KH + 8
  const target = (nextKey ?? '').toLowerCase()

  function Key({ x, y, w = KW, h = KH, label, mono = true, fontSize = 11, isHL = false, align = 'center' }: {
    x: number; y: number; w?: number; h?: number; label: string
    mono?: boolean; fontSize?: number; isHL?: boolean; align?: 'center' | 'left'
  }) {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={6}
          fill={isHL ? '#ffd23f' : '#fff6e3'}
          stroke={isHL ? '#1a1a2e' : 'rgba(26,26,46,0.2)'}
          strokeWidth={isHL ? 2.5 : 1.5} />
        <text
          x={align === 'left' ? x + 6 : x + w / 2}
          y={align === 'left' ? y + 12 : y + h / 2 + 4}
          textAnchor={align === 'left' ? 'start' : 'middle'}
          fontFamily={mono ? 'JetBrains Mono, monospace' : 'Nunito, sans-serif'}
          fontSize={fontSize} fontWeight={500}
          fill="#1a1a2e" opacity={0.6} pointerEvents="none"
        >
          {label}
        </text>
      </g>
    )
  }

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', maxWidth: SVG_W, height: 'auto', display: 'block' }} aria-label="Keyboard guide">
      {/* Keyboard background */}
      <rect x={2} y={2} width={SVG_W - 4} height={KB_BG_H - 2} rx={16}
        fill="#f0e8d0" stroke="rgba(26,26,46,0.2)" strokeWidth={3} />

      {/* Character keys */}
      {ROWS.map((row, ri) => row.map((k, ci) => {
        const p = keyPos[k]
        return <Key key={`${ri}-${ci}`} x={p.x} y={p.y} label={k} isHL={k === target} />
      }))}

      {/* Modifier / wide keys */}
      <Key x={bspX}    y={ROW_Y[0]} w={bspW}    label="backspace" mono={false} fontSize={9}  align="left" />
      <Key x={LX}      y={ROW_Y[1]} w={tabW}    label="tab"       mono={false} fontSize={10} align="left" />
      <Key x={LX}      y={ROW_Y[2]} w={capsW}   label="caps lock" mono={false} fontSize={9}  align="left" />
      <Key x={enterX}  y={ROW_Y[2]} w={enterW}  label="enter"     mono={false} fontSize={10} align="left" />
      <Key x={LX}      y={ROW_Y[3]} w={lShiftW} label="shift"     mono={false} fontSize={10} align="left" />
      <Key x={rShiftX} y={ROW_Y[3]} w={rShiftW} label="shift"     mono={false} fontSize={10} align="left" />

      {/* Bottom row */}
      {bottomPlaced.map(k => (
        <Key key={k.id} x={k.x} y={k.y} w={k.w} h={k.h}
          label={k.label} mono={false} fontSize={10}
          align={k.id === 'space' ? 'center' : 'left'}
          isHL={k.id === 'space' && nextKey === ' '} />
      ))}

      {/* Finger lines (drawn before palms so bases tuck under palm) */}
      {FINGERS.map(fid => {
        const a = ANCHORS[fid]
        const tip = fingertipFor(fid)
        if (!a || !tip) return null
        const isActive = activeFingers.has(fid)
        const fill = isActive ? '#ffd23f' : '#fff6e3'
        return (
          <g key={fid} opacity={isActive ? 1 : 0.78}>
            <line x1={a.x} y1={a.y} x2={tip.cx} y2={tip.cy}
              stroke="#1a1a2e" strokeWidth={15} strokeLinecap="round" />
            <line x1={a.x} y1={a.y} x2={tip.cx} y2={tip.cy}
              stroke={fill} strokeWidth={12} strokeLinecap="round" />
          </g>
        )
      })}

      {/* Palms (drawn after fingers so bases are covered) */}
      <ellipse cx={PALM_L.cx} cy={PALM_L.cy} rx={PALM_L.rx} ry={PALM_L.ry}
        fill="#fff6e3" stroke="#1a1a2e" strokeWidth={2.5} />
      <ellipse cx={PALM_R.cx} cy={PALM_R.cy} rx={PALM_R.rx} ry={PALM_R.ry}
        fill="#fff6e3" stroke="#1a1a2e" strokeWidth={2.5} />
    </svg>
  )
}
