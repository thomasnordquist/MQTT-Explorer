import React, { useCallback, useState, ChangeEvent, MouseEvent, useRef, useEffect, useMemo } from 'react'
import { Menu, TextField, Typography } from '@mui/material'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ChartParameters } from '../../../reducers/Charts'
import { chartActions } from '../../../actions'
import { KeyCodes } from '../../../utils/KeyCodes'

interface Props {
  actions: { chart: typeof chartActions }
  chart: ChartParameters
  anchorEl?: Element
  open: boolean
  onClose: () => void
}

function RangeSettings(props: Props) {
  const dismissClick = useCallback((e: MouseEvent) => e.stopPropagation(), [])
  const [rangeFrom, setRangeFrom] = useState<string | number | undefined>(props.chart.range && props.chart.range.from)
  const [rangeTo, setRangeTo] = useState<string | number | undefined>(props.chart.range && props.chart.range.to)
  useRangeStateToFireUpdateAction(rangeFrom, rangeTo, props)
  const rangeFromRef = useRef<HTMLInputElement>()
  const rangeToRef = useRef<HTMLInputElement>()

  useEffect(() => {
    rangeFromRef.current && rangeFromRef.current.focus()
  }, [props.open])

  const handleKeyEvents = (e: React.KeyboardEvent<any>) => {
    if (e.keyCode === KeyCodes.tab) {
      // Switch focus between those two
      if (document.activeElement === rangeFromRef.current) {
        rangeToRef.current && rangeToRef.current.focus()
      } else {
        rangeFromRef.current && rangeFromRef.current.focus()
      }

      // Prevent closing the menu
      e.stopPropagation()
      // Prevent default tab behavior (focus/blur)
      e.preventDefault()
    } else if (e.keyCode === KeyCodes.enter) {
      props.onClose()
    }
  }

  const setFromHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => setRangeFrom(e.target.value), [])
  const setToHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => setRangeTo(e.target.value), [])
  return useMemo(
    () => (
      <Menu
        style={{ textAlign: 'center' }}
        keepMounted
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={props.onClose}
        onKeyDownCapture={handleKeyEvents}
      >
        <div style={{ padding: '0 16px', width: '275px' }}>
          <Typography>Define custom ranges for the Y-Axis</Typography>
          <TextField
            inputProps={{
              ref: rangeFromRef,
            }}
            autoFocus
            style={{ marginTop: '0' }}
            label="from"
            value={rangeFrom}
            onChange={setFromHandler}
            margin="normal"
          />
          <TextField
            inputProps={{
              ref: rangeToRef,
            }}
            style={{ marginLeft: '8px', marginTop: '0' }}
            onClick={dismissClick}
            label="to"
            value={rangeTo}
            onChange={setToHandler}
            margin="normal"
          />
        </div>
      </Menu>
    ),
    [rangeFrom, rangeTo, props.open]
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    chart: bindActionCreators(chartActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(RangeSettings)

function useRangeStateToFireUpdateAction(
  rangeFrom: string | number | undefined,
  rangeTo: string | number | undefined,
  props: Props
) {
  React.useEffect(() => {
    const from = parseFloat(rangeFrom as any)
    const to = parseFloat(rangeTo as any)
    props.actions.chart.updateChart({
      topic: props.chart.topic,
      dotPath: props.chart.dotPath,
      range: {
        from: isNaN(from) ? undefined : from,
        to: isNaN(to) ? undefined : to,
      },
    })
  }, [rangeFrom, rangeTo])
}
