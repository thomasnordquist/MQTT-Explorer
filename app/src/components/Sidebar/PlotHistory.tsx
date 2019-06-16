import * as React from 'react'
import DateFormatter from '../helper/DateFormatter'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { Theme, withTheme } from '@material-ui/core'
import 'react-vis/dist/style.css'
const { XYPlot, LineMarkSeries, Hint, XAxis, YAxis, HorizontalGridLines } = require('react-vis')
const abbreviate = require('number-abbreviate')

interface Props {
  data: Array<{ x: number; y: number }>
  theme: Theme
}

export default withTheme((props: Props) => {
  const [width, setWidth] = React.useState(300)
  const [tooltip, setTooltip] = React.useState({ value: undefined })
  const detectResize = React.useCallback(width => setWidth(width), [])

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

  const data = props.data

  return React.useMemo(() => {
    return (
      <div style={{ height: '150px', overflow: 'hidden' }}>
        <XYPlot width={width} height={180}>
          <HorizontalGridLines />
          <XAxis />
          <YAxis width={45} tickFormat={(num: number) => abbreviate(num)} />
          <LineMarkSeries
            color={props.theme.palette.secondary.dark}
            onValueMouseOver={showTooltip}
            onValueMouseOut={hideTooltip}
            size={3}
            data={data}
            curve="curveMonotoneX"
          />
          {tooltip.value ? <Hint format={hintFormatter} value={tooltip.value} /> : null}
        </XYPlot>
        <ReactResizeDetector handleWidth={true} onResize={detectResize} />
      </div>
    )
  }, [width, data, tooltip])
})
