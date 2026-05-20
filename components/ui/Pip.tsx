'use client'

interface PipProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'wave' | 'celebrate' | 'default'
  className?: string
}

const SIZE_MAP = {
  sm: 48,
  md: 80,
  lg: 120,
}

export function Pip({ size = 'md', variant = 'default', className = '' }: PipProps) {
  const px = SIZE_MAP[size]

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pip mascot"
    >
      {/* Body — grape blob */}
      <ellipse cx="50" cy="56" rx="38" ry="36" fill="#9b5de5" stroke="#1a1a2e" strokeWidth="3" />

      {/* Belly highlight */}
      <ellipse cx="50" cy="62" rx="22" ry="18" fill="#ff7eb6" opacity="0.35" />

      {/* Left ear */}
      <ellipse cx="18" cy="30" rx="11" ry="14" fill="#9b5de5" stroke="#1a1a2e" strokeWidth="3" />
      {/* Right ear */}
      <ellipse cx="82" cy="30" rx="11" ry="14" fill="#9b5de5" stroke="#1a1a2e" strokeWidth="3" />

      {/* Eyes */}
      <circle cx="38" cy="48" r="7" fill="white" stroke="#1a1a2e" strokeWidth="2" />
      <circle cx="62" cy="48" r="7" fill="white" stroke="#1a1a2e" strokeWidth="2" />
      <circle cx="40" cy="49" r="3.5" fill="#1a1a2e" />
      <circle cx="64" cy="49" r="3.5" fill="#1a1a2e" />
      {/* Eye shine */}
      <circle cx="41" cy="47" r="1.2" fill="white" />
      <circle cx="65" cy="47" r="1.2" fill="white" />

      {/* Smile */}
      <path
        d="M 38 62 Q 50 72 62 62"
        stroke="#1a1a2e"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheek blush */}
      <ellipse cx="28" cy="60" rx="6" ry="4" fill="#ff7eb6" opacity="0.5" />
      <ellipse cx="72" cy="60" rx="6" ry="4" fill="#ff7eb6" opacity="0.5" />

      {/* Wave arm (only if variant === wave) */}
      {variant === 'wave' && (
        <path
          d="M 82 45 Q 95 30 88 18 Q 82 10 78 18"
          stroke="#1a1a2e"
          strokeWidth="3"
          strokeLinecap="round"
          fill="#9b5de5"
        />
      )}

      {/* Star for celebrate */}
      {variant === 'celebrate' && (
        <>
          <text x="78" y="22" fontSize="16" fill="#ffd23f" stroke="#1a1a2e" strokeWidth="0.5">✦</text>
          <text x="6" y="26" fontSize="12" fill="#ffd23f" stroke="#1a1a2e" strokeWidth="0.5">✦</text>
        </>
      )}
    </svg>
  )
}
