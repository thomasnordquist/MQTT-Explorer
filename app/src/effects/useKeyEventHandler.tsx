import { KeyCodes } from '../utils/KeyCodes'
import { useCallback } from 'react'

export function useKeyEventHandler(key: KeyCodes, callback: () => void, dependencies: Array<any> = []) {
  return useKeyEventHandlers([{ key, callback }], dependencies)
}

export function useKeyEventHandlers(
  actions: Array<{
    key: KeyCodes
    callback: (event: KeyboardEvent) => void
    preventDefault?: boolean
    stopPropagation?: boolean
  }>,
  dependencies: Array<any> = []
) {
  return useCallback(() => {
    return function handleKeyEvent(event: KeyboardEvent) {
      const action = actions.find(a => a.key === event.keyCode)
      if (action) {
        action.callback(event)
        if (action.preventDefault !== false) {
          event.preventDefault()
        }
        if (action.stopPropagation !== false) {
          event.stopPropagation()
        }
      }
    }
  }, dependencies)
}
