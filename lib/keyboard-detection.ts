const LS_KEY = 'kq-kbd-override'

/**
 * Returns true when the primary pointer is coarse (touch screen) and the device
 * reports touch points — a strong signal that no physical keyboard is attached.
 * Always returns false in SSR contexts so the guard never blocks on the server.
 */
export function looksLikeNoKeyboard(): boolean {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const hasTouch = navigator.maxTouchPoints > 0
  return coarse && hasTouch
}

/** Returns true if the user has previously confirmed a physical keyboard on this device. */
export function getKeyboardOverride(): boolean {
  try {
    return localStorage.getItem(LS_KEY) === '1'
  } catch {
    return false
  }
}

/** Persists the user's confirmation that a physical keyboard is connected on this device. */
export function setKeyboardOverride(): void {
  try {
    localStorage.setItem(LS_KEY, '1')
  } catch {
    // Ignore storage errors (private browsing, quota)
  }
}

/** Clears the keyboard override so the guard will re-evaluate on next page load. */
export function clearKeyboardOverride(): void {
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    // Ignore storage errors
  }
}
