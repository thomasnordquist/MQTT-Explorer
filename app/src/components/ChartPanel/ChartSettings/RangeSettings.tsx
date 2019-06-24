import React, { useCallback, useState, ChangeEvent, MouseEvent } from 'react'
import { ChartParameters } from '../../../reducers/Charts'
import { Menu, TextField, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
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
  const dismissTabKey = (e: React.KeyboardEvent<any>) => {
    if (e.keyCode === KeyCodes.tab) {
      e.stopPropagation()
    }
  }

  const setFromHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => setRangeFrom(e.target.value), [])
  const setToHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => setRangeTo(e.target.value), [])
  return (
    <Menu style={{ textAlign: 'center' }} anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
      <Typography>Define custom ranges for the Y-Axis</Typography>
      <div style={{ padding: '0 16px' }}>
        <TextField
          onKeyDownCapture={dismissTabKey}
          style={{ marginTop: '0' }}
          onClick={dismissClick}
          label="from"
          value={rangeFrom}
          onChange={setFromHandler}
          margin="normal"
        />
        <TextField
          style={{ marginLeft: '8px', marginTop: '0' }}
          onClick={dismissClick}
          label="to"
          value={rangeTo}
          onChange={setToHandler}
          margin="normal"
        />
      </div>
    </Menu>
  )
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
)(RangeSettings)

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
