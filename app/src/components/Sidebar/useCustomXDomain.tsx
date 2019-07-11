import { useMemo } from 'react'
import { Props } from './PlotHistory'

export function useCustomXDomain(props: Props): [number, number] | undefined {
  return useMemo(() => {
    const lastDataPoint = [...props.data].sort((a, b) => b.x - a.x)[0]
    const lastDataDate = lastDataPoint ? lastDataPoint.x : Date.now()
    return props.timeRangeStart ? [Date.now() - props.timeRangeStart, lastDataDate] : undefined
  }, [props.data, props.timeRangeStart])
}
