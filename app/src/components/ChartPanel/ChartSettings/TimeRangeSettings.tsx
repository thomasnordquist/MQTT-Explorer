import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { bindActionCreators } from 'redux'
import { Button, Menu, TextField, Typography } from '@mui/material'
import { connect } from 'react-redux'
import { chartActions } from '../../../actions'
import { ChartParameters } from '../../../reducers/Charts'

const parseDuration = require('parse-duration')

interface Props {
  actions: { chart: typeof chartActions }
  chart: ChartParameters
  anchorEl?: Element
  open: boolean
  onClose: () => void
}

function TimeRangeSettings(props: Props) {
  const dismissClick = useCallback((e: MouseEvent) => e.stopPropagation(), [])
  const [value, setValue] = useState<string | undefined>(
    props.chart.timeRange ? props.chart.timeRange.until : undefined
  )
  const ranges = ['all', '10s', '30s', '1m', '5m', '15m', '1h', '6h', '1d']

  const manuallySetIntervalHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [])

  useEffect(() => {
    if (!value) {
      props.actions.chart.updateChart({
        ...props.chart,
        timeRange: undefined,
      })
      return
    }

    const canBeParsed = Boolean(parseDuration(value))
    if (canBeParsed) {
      props.actions.chart.updateChart({
        ...props.chart,
        timeRange: {
          until: value,
        },
      })
    }
  }, [value])

  return useMemo(() => {
    const createRangeHandler = (range: string) => (e: React.MouseEvent) => setValue(range === 'all' ? undefined : range)

    return (
      <Menu
        style={{ textAlign: 'center' }}
        keepMounted
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={props.onClose}
      >
        <Typography>Chart data within a time interval</Typography>
        <div style={{ padding: '0 16px', width: '275px', textAlign: 'center' }}>
          {ranges.map(r => (
            <Button
              style={{ margin: '4px', textTransform: 'none' }}
              variant="contained"
              key={r}
              onClick={createRangeHandler(r)}
            >
              {r}
            </Button>
          ))}
        </div>
        <Typography style={{ fontSize: '0.75em' }}>
          <i>Limited to 500 data points</i>
        </Typography>
        <br />
        <TextField
          style={{ marginLeft: '8px', marginTop: '0' }}
          onClick={dismissClick}
          label="custom interval"
          value={value || ''}
          onChange={manuallySetIntervalHandler}
          margin="normal"
        />
      </Menu>
    )
  }, [value, props.open])
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    chart: bindActionCreators(chartActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(TimeRangeSettings)
