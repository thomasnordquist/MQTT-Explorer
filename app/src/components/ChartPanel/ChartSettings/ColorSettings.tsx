import React, { memo } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Menu, MenuItem } from '@mui/material'
import { chartActions } from '../../../actions'
import { ChartParameters } from '../../../reducers/Charts'
import { colors as createColors } from './colors'

function chartParametersForColor(chart: ChartParameters, color?: string) {
  return {
    color,
    topic: chart.topic,
    dotPath: chart.dotPath,
  }
}

const colors: Array<string> = createColors()

function ColorSettings(props: {
  chart: ChartParameters
  actions: {
    chart: typeof chartActions
  }
  anchorEl?: Element
  open: boolean
  close: () => void
}) {
  const setColor = React.useCallback(
    (color?: string) => props.actions.chart.updateChart(chartParametersForColor(props.chart, color)),
    [props.chart]
  )

  const menuItems = React.useMemo(
    () =>
      colors.map(color => (
        <MenuItem
          style={{
            minWidth: '8em',
            minHeight: '36px',
            backgroundColor: color,
            textAlign: 'center',
          }}
          key={color}
          onClick={() => setColor(color)}
        >
          {props.chart.color === color ? 'X' : ''}
        </MenuItem>
      )),
    [colors, props.chart]
  )

  return (
    <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.close}>
      <MenuItem
        style={{ minWidth: '8em', minHeight: '36px', textAlign: 'center' }}
        key="none"
        onClick={() => setColor()}
        selected={props.chart.color === undefined}
      >
        default
      </MenuItem>
      {menuItems}
    </Menu>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    chart: bindActionCreators(chartActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(memo(ColorSettings))
