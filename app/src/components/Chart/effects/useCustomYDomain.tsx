import { useMemo } from 'react'
import { Props } from '../Chart'
import { Point } from '../Model'

function defaultFor(a: number | undefined, b: number) {
  return a === undefined ? b : a
}

export function useCustomYDomain(props: Props) {
  return useMemo(() => {
    const { data } = props
    const calculatedDomain = domainForData(data)
    const yDomain: [number, number] = props.range
      ? [defaultFor(props.range[0], calculatedDomain[0]), defaultFor(props.range[1], calculatedDomain[1])]
      : calculatedDomain

    return yDomain
  }, [props.data, props.range])
}

function domainForData(data: Array<Point>): [number, number] {
  if (!data[0]) {
    const defaultDomain: [number, number] = [-1, 1]
    return defaultDomain
  }

  let max = data[0].y
  let min = data[0].y

  data.forEach(d => {
    if (max < d.y) {
      max = d.y
    }
    if (min > d.y) {
      min = d.y
    }
  })
  if ((max === 1 || max === 0) && (min === 1 || min === 0)) {
    return [0, 1]
  }
  if (min === max) {
    return [min - 0.5 * min, min + 0.5 * min]
  }
  return [min, max]
}
