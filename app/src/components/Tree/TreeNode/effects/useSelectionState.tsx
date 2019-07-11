import { useCallback, useState } from 'react'

interface SelectedState {
  selected: boolean
  lastUpdate: number
}

export function useSelectionState(initialSelectionState: boolean): [boolean, number, (selected: boolean) => void] {
  const [state, setState] = useState<SelectedState>({ selected: initialSelectionState, lastUpdate: 0 })
  const setSelected = useCallback((selected: boolean) => {
    setState({ selected, lastUpdate: Date.now() })
  }, [])
  return [state.selected, state.lastUpdate, setSelected]
}
