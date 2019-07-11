import DateFormatter from '../helper/DateFormatter'
import NumberFormatter from '../helper/NumberFormatter'
import Portal from '@material-ui/core/Portal'
import React, { useRef, useCallback, useState } from 'react'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { PlotCurveTypes } from '../../reducers/Charts'
import { Theme, Typography, withTheme, Popper, Paper } from '@material-ui/core'
import { useCustomXDomain } from './useCustomXDomain'
import 'react-vis/dist/style.css'
import { number } from 'prop-types'
import { fade } from '@material-ui/core/styles'
import { toggleAdvancedSettings } from '../../actions/ConnectionManager'
const { XYPlot, LineMarkSeries, Hint, XAxis, YAxis, HorizontalGridLines, Highlight, MouseEvent } = require('react-vis')
const abbreviate = require('number-abbreviate')

export interface Props {
  data: Array<{ x: number; y: number }>
  theme: Theme
  interpolation?: PlotCurveTypes
  range?: [number?, number?]
  timeRangeStart?: number
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

function useToggle(initialState: boolean): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialState)
  const toggle = useCallback(() => {
    setValue(!value)
  }, [value])

  return [value, toggle, setValue]
}

export default withTheme((props: Props) => {
  const [hintStaysOpen, toggleHintStaysOpen, setStaysOpen] = useToggle(false)
  const [width, setWidth] = React.useState(300)
  const [tooltip, setTooltip] = React.useState<{ value: any; element: any } | undefined>()
  const detectResize = React.useCallback(newWidth => setWidth(newWidth), [])

  const hintFormatter = React.useCallback((point: any) => {
    return [
      { title: <b>Time</b>, value: <DateFormatter timeFirst={true} date={new Date(point.x)} /> },
      { title: <b>Value</b>, value: <NumberFormatter value={point.y} /> },
      { title: <b>Raw</b>, value: point.y },
    ]
  }, [])

  const hideTooltip = React.useCallback(() => {
    if (!hintStaysOpen) {
      setTooltip(undefined)
    }
  }, [hintStaysOpen])

  const onMouseLeave = React.useCallback(() => {
    setStaysOpen(false)
    setTooltip(undefined)
  }, [])

  const showTooltip = React.useCallback((value: any, something: { event: MouseEvent }) => {
    if (!something) {
      return
    }
    setTooltip({ value: hintFormatter(value), element: something.event.target })
  }, [])

  const onValueClick = React.useCallback(
    (value: any, something: { event: MouseEvent }) => {
      toggleHintStaysOpen()
      console.log('onValueClick')

      showTooltip(value, something)
    },
    [toggleHintStaysOpen]
  )

  const xDomain = useCustomXDomain(props)

  return React.useMemo(() => {
    const data = props.data
    const calculatedDomain = domainForData(data)
    const yDomain: [number, number] = props.range
      ? [props.range[0] || calculatedDomain[0], props.range[1] || calculatedDomain[1]]
      : calculatedDomain

    let color: string =
      props.theme.palette.type === 'light' ? props.theme.palette.secondary.dark : props.theme.palette.primary.light
    if (props.color) {
      color = props.color
    }

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
            <YAxis width={45} tickFormat={(num: number) => abbreviate(num)} />
            <LineMarkSeries
              color={color}
              onValueMouseOver={showTooltip}
              onValueMouseOut={hideTooltip}
              onValueClick={onValueClick}
              size={3}
              data={hasData ? data : dummyData}
              curve={mapCurveType(props.interpolation)}
            />
            <Hint value={{}}>
              <Popper open={Boolean(tooltip)} placement="top" anchorEl={tooltip && tooltip.element}>
                <div
                  style={{
                    paddingBottom: '8px',
                  }}
                >
                  <Paper
                    style={{
                      padding: '4px',
                      marginTop: '-12px',
                      backgroundColor: fade(
                        props.theme.palette.type === 'light'
                          ? props.theme.palette.background.paper
                          : props.theme.palette.background.default,
                        0.7
                      ),
                    }}
                  >
                    <table style={{ lineHeight: '1.25em' }}>
                      <tbody>
                        {tooltip &&
                          tooltip.value.map((v: any, idx: number) => (
                            <tr key={idx}>
                              <td>
                                <Typography style={{ lineHeight: '1.2' }}>{v.title}</Typography>
                              </td>
                              <td>
                                <Typography style={{ lineHeight: '1.2' }}>{v.value}</Typography>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </Paper>
                </div>
              </Popper>
            </Hint>
          </XYPlot>
          <ReactResizeDetector handleWidth={true} onResize={detectResize} />
        </div>
      </div>
    )
  }, [width, props.data, tooltip, props.interpolation, props.range, props.color, props.theme, xDomain])
})

function NoData() {
  return (
    <div
      style={{
        height: '100%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        color: '#ccc',
        verticalAlign: 'middle',
        paddingLeft: '30px',
        zIndex: 10,
      }}
    >
      <Typography style={{ fontWeight: 'bold' }} variant="h5">
        No Data
      </Typography>
    </div>
  )
}

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
