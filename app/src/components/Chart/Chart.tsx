import React, { memo, useCallback, useMemo, useRef } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { emphasize, useTheme } from '@mui/material/styles'
import { XYChart, Axis, Grid, LineSeries, GlyphSeries } from '@visx/xychart'
import DateFormatter from '../helper/DateFormatter'
import NoData from './NoData'
import NumberFormatter from '../helper/NumberFormatter'
import TooltipComponent from './TooltipComponent'
import { mapCurveType } from './mapCurveType'
import { PlotCurveTypes } from '../../reducers/Charts'
import { Point, Tooltip } from './Model'
import { useCustomXDomain } from './effects/useCustomXDomain'
import { useCustomYDomain } from './effects/useCustomYDomain'

const abbreviate = require('number-abbreviate')

export interface Props {
  data: Array<{ x: number; y: number }>
  interpolation?: PlotCurveTypes
  range?: [number?, number?]
  timeRangeStart?: number
  color?: string
}

const CHART_HEIGHT = 150

export default memo((props: Props) => {
  const theme = useTheme()
  const [tooltip, setTooltip] = React.useState<Tooltip | undefined>()
  const [hoveredPoint, setHoveredPoint] = React.useState<Point | undefined>()
  const { width = 300, ref } = useResizeDetector()
  const chartContainerRef = React.useRef<HTMLDivElement>(null)

  // Screen position of the pointer, updated on every move. The tooltip is anchored to a
  // stable virtual element that reads from this ref, so the Popper instance is reused
  // instead of being re-created on each pointer move.
  const pointerPosition = useRef({ x: 0, y: 0 })
  const pointerAnchor = useMemo(
    () => ({
      getBoundingClientRect: () => new DOMRect(pointerPosition.current.x, pointerPosition.current.y, 0, 0),
    }),
    []
  )

  const hintFormatter = React.useCallback(
    (point: any) => [
      { title: <b>Time</b>, value: <DateFormatter timeFirst date={new Date(point.x)} /> },
      { title: <b>Value</b>, value: <NumberFormatter value={point.y} /> },
      { title: <b>Raw</b>, value: <span>{point.y}</span> },
    ],
    []
  )

  const onMouseLeave = React.useCallback(() => {
    setTooltip(undefined)
    setHoveredPoint(undefined)
  }, [])

  const showTooltip = React.useCallback(
    (point: Point, event?: React.PointerEvent | React.FocusEvent) => {
      if (event && 'clientX' in event) {
        pointerPosition.current = { x: event.clientX, y: event.clientY }
        setHoveredPoint(point)
        setTooltip({ point, value: hintFormatter(point), element: pointerAnchor })
        return
      }
      // Keyboard focus or missing event: fall back to anchoring on the chart itself
      if (!chartContainerRef.current) {
        return
      }
      setHoveredPoint(point)
      setTooltip({ point, value: hintFormatter(point), element: chartContainerRef.current })
    },
    [hintFormatter, pointerAnchor]
  )

  const paletteColor = theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.primary.light
  const color = props.color ? props.color : paletteColor

  const highlightSelectedPoint = useCallback(
    (point: Point) => {
      const highlight = hoveredPoint && hoveredPoint.x === point.x && hoveredPoint.y === point.y
      return highlight ? emphasize(color, 0.8) : color
    },
    [hoveredPoint, color]
  )

  const formatYAxis = useCallback((num: number) => abbreviate(num), [])

  const formatXAxis = useCallback((timestamp: number) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }, [])

  const xDomain = useCustomXDomain(props)
  const yDomain = useCustomYDomain(props)

  const { data } = props
  const hasData = data.length > 0
  const dummyDomain: [number, number] = [-1, 1]
  const dummyData = [{ x: -2, y: -2 }]

  const accessors = useMemo(
    () => ({
      xAccessor: (d: Point) => d.x,
      yAccessor: (d: Point) => d.y,
    }),
    []
  )

  return (
    <div>
      <div ref={ref} style={{ height: `${CHART_HEIGHT}px`, width: '100%', position: 'relative' }}>
        {data.length === 0 ? <NoData /> : null}
        <div ref={chartContainerRef}>
          <XYChart
            width={width || 300}
            height={CHART_HEIGHT}
            margin={{
              top: 10,
              right: 10,
              bottom: 30,
              left: 50,
            }}
            xScale={{ type: 'time', domain: xDomain || dummyDomain }}
            yScale={{ type: 'linear', domain: hasData ? yDomain : dummyDomain }}
            onPointerOut={onMouseLeave}
          >
            <Grid rows columns={false} stroke={theme.palette.divider} strokeOpacity={0.3} />
            <Axis
              orientation="left"
              numTicks={5}
              tickFormat={formatYAxis}
              stroke={theme.palette.text.secondary}
              tickStroke={theme.palette.text.secondary}
              tickLabelProps={() => ({ fontSize: 11, fill: theme.palette.text.secondary })}
            />
            <Axis
              orientation="bottom"
              numTicks={4}
              tickFormat={formatXAxis}
              stroke={theme.palette.text.secondary}
              tickStroke={theme.palette.text.secondary}
              tickLabelProps={() => ({ fontSize: 10, fill: theme.palette.text.secondary, textAnchor: 'middle' })}
            />
            <LineSeries
              dataKey="line"
              data={hasData ? data : dummyData}
              xAccessor={accessors.xAccessor}
              yAccessor={accessors.yAccessor}
              stroke={color}
              strokeWidth={2}
              curve={mapCurveType(props.interpolation)}
              onPointerMove={params => {
                // visx types this handler as a union with a plain SVG pointer handler
                if ('datum' in params && params.datum) {
                  showTooltip(params.datum as Point, params.event)
                }
              }}
            />
            <GlyphSeries
              dataKey="points"
              data={hasData ? data : dummyData}
              xAccessor={accessors.xAccessor}
              yAccessor={accessors.yAccessor}
              renderGlyph={glyphProps => {
                const point = glyphProps.datum as Point
                const pointColor = highlightSelectedPoint(point)
                return <circle cx={glyphProps.x} cy={glyphProps.y} r={3} fill={pointColor} />
              }}
            />
          </XYChart>
        </div>
        {/* Custom tooltip outside of visx to maintain exact same appearance */}
        <TooltipComponent tooltip={tooltip} />
      </div>
    </div>
  )
})
