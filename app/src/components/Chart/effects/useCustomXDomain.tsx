import { useMemo } from 'react'
import { Props } from '../Chart'

export function useCustomXDomain(props: Props): [number, number] | undefined {
  return useMemo(() => {
    if (props.data.length === 0) {
      return undefined
    }

    const sortedData = [...props.data].sort((a, b) => a.x - b.x)
    const firstDataPoint = sortedData[0]
    const lastDataPoint = sortedData[sortedData.length - 1]
    
    if (props.timeRangeStart) {
      // Use custom time range if specified
      const lastDataDate = lastDataPoint ? lastDataPoint.x : Date.now()
      return [Date.now() - props.timeRangeStart, lastDataDate]
    } else {
      // Auto-calculate domain from data min/max
      return [firstDataPoint.x, lastDataPoint.x]
    }
  }, [props.data, props.timeRangeStart])
}
