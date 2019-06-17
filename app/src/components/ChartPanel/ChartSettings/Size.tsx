import * as React from 'react'
import { ChartParameters } from '../../../reducers/Charts'
import { Menu, MenuItem, TextField, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../../actions'

function Size(props: {
  actions: { chart: typeof chartActions }
  chart: ChartParameters
  anchorEl?: Element
  open: boolean
  close: () => void
}) {
  const setChartWidth = (width?: 'big' | 'medium' | 'small') => () => {
    props.actions.chart.updateChart({
      width,
      topic: props.chart.topic,
      dotPath: props.chart.dotPath,
    })
    props.close()
  }

  return (
    <Menu anchorEl={props.anchorEl} open={props.open} onClose={props.close}>
      <MenuItem selected={props.chart.width === undefined} onClick={setChartWidth()}>
        auto
      </MenuItem>
      <MenuItem selected={props.chart.width === 'big'} onClick={setChartWidth('big')}>
        100% width
      </MenuItem>
      <MenuItem selected={props.chart.width === 'medium'} onClick={setChartWidth('medium')}>
        50% width
      </MenuItem>
      <MenuItem selected={props.chart.width === 'small'} onClick={setChartWidth('small')}>
        33% width
      </MenuItem>
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
)(Size)
