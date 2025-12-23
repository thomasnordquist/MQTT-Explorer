/**
 * Utility to detect if the application is running in browser mode
 * Browser mode is when the app runs in a web browser (not Electron desktop app)
 */
export const isBrowserMode =
  typeof window !== 'undefined' && (typeof process === 'undefined' || process.env?.BROWSER_MODE === 'true')
