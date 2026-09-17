import { useEffect } from 'react'
import { KeyCodes } from '../utils/KeyCodes'

export function useGlobalKeyEventHandler(
  key: KeyCodes | undefined,
  callback: (event: KeyboardEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    function handleKeyEvent(event: KeyboardEvent) {
      if (key === undefined) {
        callback(event)
      } else if (event.keyCode === key) {
        callback(event)
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyEvent, false)
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyEvent, false)
    }
  }, [callback, enabled, key])
}
