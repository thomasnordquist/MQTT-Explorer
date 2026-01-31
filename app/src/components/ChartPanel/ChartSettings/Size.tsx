import React, { memo } from 'react'
import { Menu, MenuItem, TextField, Typography } from '@mui/material'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ChartParameters } from '../../../reducers/Charts'
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
        <Typography variant="inherit">auto</Typography>
      </MenuItem>
      <MenuItem selected={props.chart.width === 'big'} onClick={setChartWidth('big')}>
        <Typography variant="inherit">100% width</Typography>
      </MenuItem>
      <MenuItem selected={props.chart.width === 'medium'} onClick={setChartWidth('medium')}>
        <Typography variant="inherit">50% width</Typography>
      </MenuItem>
      <MenuItem selected={props.chart.width === 'small'} onClick={setChartWidth('small')}>
        <Typography variant="inherit">33% width</Typography>
      </MenuItem>
    </Menu>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    chart: bindActionCreators(chartActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(memo(Size))
