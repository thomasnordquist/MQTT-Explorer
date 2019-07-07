import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { bindActionCreators } from 'redux'
import { Button, Menu, TextField, Typography } from '@material-ui/core'
import { chartActions } from '../../../actions'
import { ChartParameters } from '../../../reducers/Charts'
import { connect } from 'react-redux'
import { KeyCodes } from '../../../utils/KeyCodes'
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

  const manuallySetIntervalHandler = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => setValue(e.currentTarget.value),
    []
  )

  useEffect(() => {
    if (!value) {
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
        keepMounted={true}
        anchorEl={props.anchorEl}
        open={props.open}
        onClose={props.onClose}
      >
        <Typography>Discard values older then</Typography>
        <div style={{ padding: '0 16px', width: '300px', textAlign: 'center' }}>
          {ranges.map(r => {
            return (
              <Button
                style={{ margin: '4px', textTransform: 'none' }}
                variant="contained"
                key={r}
                onClick={createRangeHandler(r)}
              >
                {r}
              </Button>
            )
          })}
        </div>
        <br />
        <TextField
          style={{ marginLeft: '8px', marginTop: '0' }}
          onClick={dismissClick}
          label="interval"
          value={value || ''}
          onKeyPress={manuallySetIntervalHandler}
          margin="normal"
        />
      </Menu>
    )
  }, [value, props.open])
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      chart: bindActionCreators(chartActions, dispatch),
    },
  }
}

export default connect(
  undefined,
  mapDispatchToProps
)(TimeRangeSettings)
