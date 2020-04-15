import DateFormatter from '../helper/DateFormatter'
import NoData from './NoData'
import NumberFormatter from '../helper/NumberFormatter'
import React, { memo, useCallback } from 'react'
import TooltipComponent from './TooltipComponent'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { emphasize } from '@material-ui/core/styles'
import { mapCurveType } from './mapCurveType'
import { PlotCurveTypes } from '../../reducers/Charts'
import { Point, Tooltip } from './Model'
import { Theme, withTheme } from '@material-ui/core'
import { useCustomXDomain } from './effects/useCustomXDomain'
import { useCustomYDomain } from './effects/useCustomYDomain'
import 'react-vis/dist/style.css'
const { XYPlot, LineMarkSeries, YAxis, HorizontalGridLines, Hint } = require('react-vis')
const abbreviate = require('number-abbreviate')

export interface Props {
  data: Array<{ x: number; y: number }>
  theme: Theme
  interpolation?: PlotCurveTypes
  range?: [number?, number?]
  timeRangeStart?: number
  color?: string
}

export default withTheme(
  memo((props: Props) => {
    const [width, setWidth] = React.useState(300)
    const [tooltip, setTooltip] = React.useState<Tooltip | undefined>()
    const detectResize = React.useCallback((newWidth) => setWidth(newWidth), [])

    const hintFormatter = React.useCallback(
      (point: any) => [
        { title: <b>Time</b>, value: <DateFormatter timeFirst={true} date={new Date(point.x)} /> },
        { title: <b>Value</b>, value: <NumberFormatter value={point.y} /> },
        { title: <b>Raw</b>, value: <span>{point.y}</span> },
      ],
      []
    )

    const onMouseLeave = React.useCallback(() => {
      setTooltip(undefined)
    }, [])

    const showTooltip = React.useCallback((point: Point, something: { event: MouseEvent }) => {
      if (!something) {
        return
      }
      setTooltip({ point, value: hintFormatter(point), element: something.event.target as any })
    }, [])

    const paletteColor =
      props.theme.palette.type === 'light' ? props.theme.palette.secondary.dark : props.theme.palette.primary.light
    const color = props.color ? props.color : paletteColor

    const highlightSelectedPoint = useCallback(
      (point: Point) => {
        const highlight = tooltip && tooltip.point.x === point.x && tooltip.point.y === point.y
        return highlight ? emphasize(color, 0.8) : color
      },
      [tooltip, color]
    )

    const formatYAxis = useCallback((num: number) => abbreviate(num), [])

    const xDomain = useCustomXDomain(props)
    const yDomain = useCustomYDomain(props)

    const data = props.data
    const hasData = data.length > 0
    const dummyDomain = [-1, 1]
    const dummyData = [{ x: -2, y: -2 }]
    return (
      <div>
        <div style={{ height: '150px', width: '100%', position: 'relative' }}>
          {data.length === 0 ? <NoData /> : null}
          <XYPlot
            width={width}
            height={180}
            yDomain={hasData ? yDomain : dummyDomain}
            xDomain={hasData ? xDomain : dummyDomain}
            onMouseLeave={onMouseLeave}
          >
            <HorizontalGridLines />
            <YAxis width={45} tickFormat={formatYAxis} />
            <LineMarkSeries
              color={color}
              colorType="literal"
              getColor={highlightSelectedPoint}
              onValueMouseOver={showTooltip}
              size={3}
              data={hasData ? data : dummyData}
              curve={mapCurveType(props.interpolation)}
            />
            <Hint value={{ x: 0, y: 0 }} style={{ pointerEvents: 'none' }}>
              <TooltipComponent tooltip={tooltip} theme={props.theme} />
            </Hint>
          </XYPlot>
          <ReactResizeDetector handleWidth={true} onResize={detectResize} />
        </div>
      </div>
    )
  })
)
