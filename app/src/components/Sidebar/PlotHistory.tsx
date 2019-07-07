import * as React from 'react'
import DateFormatter from '../helper/DateFormatter'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { PlotCurveTypes } from '../../reducers/Charts'
import { Theme, withTheme } from '@material-ui/core'
import 'react-vis/dist/style.css'
const { XYPlot, LineMarkSeries, Hint, XAxis, YAxis, HorizontalGridLines } = require('react-vis')
const abbreviate = require('number-abbreviate')

interface Props {
  data: Array<{ x: number; y: number }>
  theme: Theme
  interpolation?: PlotCurveTypes
  range?: [number?, number?]
  color?: string
}

function mapCurveType(type: PlotCurveTypes | undefined) {
  switch (type) {
    case 'curve':
      return 'curveMonotoneX'
    case 'linear':
      return 'curveLinear'
    case 'cubic_basis_spline':
      return 'curveBasis'
    case 'step_after':
      return 'curveStepAfter'
    case 'step_before':
      return 'curveStepBefore'
    default:
      return 'curveMonotoneX'
  }
}

export default withTheme((props: Props) => {
  const [width, setWidth] = React.useState(300)
  const [tooltip, setTooltip] = React.useState({ value: undefined })
  const detectResize = React.useCallback(newWidth => setWidth(newWidth), [])

  const hintFormatter = React.useCallback((point: any) => {
    return [
      { title: <b>Time</b>, value: <DateFormatter date={new Date(point.x)} /> },
      { title: <b>Value</b>, value: point.y },
    ]
  }, [])

  const hideTooltip = React.useCallback(() => {
    setTooltip({ value: undefined })
  }, [])

  const showTooltip = React.useCallback((value: any) => {
    setTooltip({ value })
  }, [])

  return React.useMemo(() => {
    const data = props.data
    const calculatedDomain = domainForData(data)
    let yDomain: [number, number] = props.range
      ? [props.range[0] || calculatedDomain[0], props.range[1] || calculatedDomain[1]]
      : calculatedDomain

    let color: string =
      props.theme.palette.type === 'light' ? props.theme.palette.secondary.dark : props.theme.palette.primary.light
    if (props.color) {
      color = props.color
    }

    return (
      <div style={{ height: '150px', overflow: 'hidden' }}>
        <XYPlot width={width} height={180} yDomain={yDomain}>
          <HorizontalGridLines />
          <XAxis />
          <YAxis width={45} tickFormat={(num: number) => abbreviate(num)} />
          <LineMarkSeries
            color={color}
            onValueMouseOver={showTooltip}
            onValueMouseOut={hideTooltip}
            size={3}
            data={data}
            curve={mapCurveType(props.interpolation)}
          />
          {tooltip.value ? <Hint format={hintFormatter} value={tooltip.value} /> : null}
        </XYPlot>
        <ReactResizeDetector handleWidth={true} onResize={detectResize} />
      </div>
    )
  }, [width, props.data, tooltip, props.interpolation, props.range, props.color, props.theme])
})

function domainForData(data: Array<{ x: number; y: number }>): [number, number] {
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
