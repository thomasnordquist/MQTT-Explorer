import DateFormatter from '../helper/DateFormatter'
import NoData from './NoData'
import NumberFormatter from '../helper/NumberFormatter'
import React, { memo, useCallback, useMemo } from 'react'
import TooltipComponent from './TooltipComponent'
import { useResizeDetector } from 'react-resize-detector'
import { emphasize, useTheme } from '@mui/material/styles'
import { mapCurveType } from './mapCurveType'
import { PlotCurveTypes } from '../../reducers/Charts'
import { Point, Tooltip } from './Model'
import { useCustomXDomain } from './effects/useCustomXDomain'
import { useCustomYDomain } from './effects/useCustomYDomain'
import { XYChart, AnimatedAxis, AnimatedGrid, AnimatedLineSeries, AnimatedGlyphSeries } from '@visx/xychart'
const abbreviate = require('number-abbreviate')

export interface Props {
  data: Array<{ x: number; y: number }>
  interpolation?: PlotCurveTypes
  range?: [number?, number?]
  timeRangeStart?: number
  color?: string
}

export default memo((props: Props) => {
  const theme = useTheme()
  const [tooltip, setTooltip] = React.useState<Tooltip | undefined>()
  const [hoveredPoint, setHoveredPoint] = React.useState<Point | undefined>()
  const { width = 300, ref } = useResizeDetector()
  const chartContainerRef = React.useRef<HTMLDivElement>(null)

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
    setHoveredPoint(undefined)
  }, [])

  const showTooltip = React.useCallback(
    (point: Point) => {
      if (!chartContainerRef.current) {
        return
      }
      setHoveredPoint(point)
      setTooltip({ point, value: hintFormatter(point), element: chartContainerRef.current })
    },
    [hintFormatter]
  )

  const paletteColor =
    theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.primary.light
  const color = props.color ? props.color : paletteColor

  const highlightSelectedPoint = useCallback(
    (point: Point) => {
      const highlight = hoveredPoint && hoveredPoint.x === point.x && hoveredPoint.y === point.y
      return highlight ? emphasize(color, 0.8) : color
    },
    [hoveredPoint, color]
  )

  const formatYAxis = useCallback((num: number) => abbreviate(num), [])

  const xDomain = useCustomXDomain(props)
  const yDomain = useCustomYDomain(props)

  const data = props.data
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
      <div ref={ref} style={{ height: '150px', width: '100%', position: 'relative' }}>
        {data.length === 0 ? <NoData /> : null}
        <div ref={chartContainerRef}>
          <XYChart
            width={width || 300}
            height={180}
            xScale={{ type: 'linear', domain: hasData ? (xDomain || dummyDomain) : dummyDomain }}
            yScale={{ type: 'linear', domain: hasData ? yDomain : dummyDomain }}
            onPointerOut={onMouseLeave}
          >
            <AnimatedGrid rows={true} columns={false} />
            <AnimatedAxis orientation="left" tickFormat={formatYAxis} />
            <AnimatedLineSeries
              dataKey="line"
              data={hasData ? data : dummyData}
              {...accessors}
              stroke={color}
              curve={mapCurveType(props.interpolation)}
              onPointerMove={(datum) => {
                if (datum && datum.datum) {
                  const point = datum.datum as Point
                  showTooltip(point)
                }
              }}
            />
            <AnimatedGlyphSeries
              dataKey="points"
              data={hasData ? data : dummyData}
              {...accessors}
              renderGlyph={(glyphProps) => {
                const point = glyphProps.datum as Point
                const pointColor = highlightSelectedPoint(point)
                return (
                  <circle
                    cx={glyphProps.x}
                    cy={glyphProps.y}
                    r={3}
                    fill={pointColor}
                  />
                )
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
