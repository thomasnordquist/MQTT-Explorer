import { useMemo } from 'react'
import { Props } from '../Chart'

export function useCustomXDomain(props: Props): [number, number] | undefined {
  return useMemo(() => {
    if (props.data.length === 0) {
      return undefined
    }

    const lastDataPoint = [...props.data].sort((a, b) => b.x - a.x)[0]
    const lastDataDate = lastDataPoint ? lastDataPoint.x : Date.now()

    if (props.timeRangeStart) {
      // Custom time range mode
      return [Date.now() - props.timeRangeStart, lastDataDate]
    }
    // Auto-calculate from data (like react-vis did)
    const xValues = props.data.map(d => d.x)
    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    return [minX, maxX]
  }, [props.data, props.timeRangeStart])
}
