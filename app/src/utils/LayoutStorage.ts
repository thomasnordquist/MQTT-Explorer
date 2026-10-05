/**
 * Remembers user adjusted layout sizes (e.g. sidebar width, value panel height) across restarts.
 * Uses localStorage since it is synchronous, so the stored size is applied on the first render.
 */
const prefix = 'layout.'

export function loadLayoutSize(key: string): string | number | undefined {
  try {
    const value = window.localStorage.getItem(prefix + key)
    if (!value) {
      return undefined
    }
    const parsed = JSON.parse(value)
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : undefined
  } catch (error) {
    return undefined
  }
}

export function storeLayoutSize(key: string, size: string | number) {
  try {
    window.localStorage.setItem(prefix + key, JSON.stringify(size))
  } catch (error) {
    // Layout persistence is a convenience, ignore storage errors
  }
}
