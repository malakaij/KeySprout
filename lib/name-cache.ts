/** Teacher-side display-name cache. Stored in localStorage only — never sent to the server (ADR-0008). */

type NameMapping = Record<string, string>

function storageKey(classroomId: string): string {
  return `kq-names-${classroomId}`
}

/** Returns the saved userId → displayName mapping for a classroom. */
export function getNames(classroomId: string): NameMapping {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(storageKey(classroomId))
    return raw ? (JSON.parse(raw) as NameMapping) : {}
  } catch {
    return {}
  }
}

/** Saves a single userId → displayName entry for a classroom. */
export function setName(classroomId: string, userId: string, displayName: string): void {
  if (typeof window === 'undefined') return
  const mapping = getNames(classroomId)
  mapping[userId] = displayName
  localStorage.setItem(storageKey(classroomId), JSON.stringify(mapping))
}

/** Replaces the entire mapping for a classroom (used after CSV import). */
export function setNames(classroomId: string, mapping: NameMapping): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(classroomId), JSON.stringify(mapping))
}

/** Removes all saved names for a classroom. */
export function clearNames(classroomId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(storageKey(classroomId))
}
