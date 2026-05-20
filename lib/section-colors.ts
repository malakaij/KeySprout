export const SECTION_PALETTE = [
  { bg: 'bg-mint/20', solid: 'bg-mint', border: 'border-mint', badgeClass: 'bg-mint/20 border-mint text-ink', accentText: 'text-ink', hex: '#4dd4ac' },
  { bg: 'bg-sky/20', solid: 'bg-sky', border: 'border-sky', badgeClass: 'bg-sky/20 border-sky text-ink', accentText: 'text-white', hex: '#4ea8de' },
  { bg: 'bg-sunny/20', solid: 'bg-sunny', border: 'border-sunny', badgeClass: 'bg-sunny/20 border-sunny text-ink', accentText: 'text-ink', hex: '#ffd23f' },
  { bg: 'bg-grape/20', solid: 'bg-grape', border: 'border-grape', badgeClass: 'bg-grape/20 border-grape text-ink', accentText: 'text-white', hex: '#9b5de5' },
  { bg: 'bg-coral/20', solid: 'bg-coral', border: 'border-coral', badgeClass: 'bg-coral/20 border-coral text-ink', accentText: 'text-white', hex: '#ff5e5b' },
  { bg: 'bg-berry/20', solid: 'bg-berry', border: 'border-berry', badgeClass: 'bg-berry/20 border-berry text-ink', accentText: 'text-ink', hex: '#ff7eb6' },
]

/** Returns the palette entry for a given section index, wrapping cyclically. */
export function sectionColor(index: number) {
  return SECTION_PALETTE[index % SECTION_PALETTE.length]
}
