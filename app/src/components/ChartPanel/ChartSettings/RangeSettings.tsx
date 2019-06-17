import * as React from 'react'
import { ChartParameters } from '../../../reducers/Charts'
import { Menu, MenuItem, TextField, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../../actions'

function RangeSettings(props: {
  actions: { chart: typeof chartActions }
  chart: ChartParameters
  anchorEl?: Element
  open: boolean
  onClose: () => void
}) {
  const dismissClick = React.useCallback((e: React.MouseEvent) => e.stopPropagation(), [])
  const [rangeFrom, setRangeFrom] = React.useState<string | number | undefined>(
    props.chart.range && props.chart.range.from
  )
  const [rangeTo, setRangeTo] = React.useState<string | number | undefined>(props.chart.range && props.chart.range.to)

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

  const setFromHandler = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => setRangeFrom(e.target.value), [])
  const setToHandler = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => setRangeTo(e.target.value), [])
  return (
    <Menu
      style={{ textAlign: 'center' }}
      id="long-menu"
      anchorEl={props.anchorEl}
      open={props.open}
      onClose={props.onClose}
    >
      <Typography>Define custom ranges for the Y-Axis</Typography>
      <div style={{ padding: '0 16px' }}>
        <TextField
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
