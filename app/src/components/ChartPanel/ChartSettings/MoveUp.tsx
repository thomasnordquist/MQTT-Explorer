import * as React from 'react'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { MenuItem, Typography, ListItemIcon } from '@mui/material'
import { chartActions } from '../../../actions'
import { ChartParameters } from '../../../reducers/Charts'

function MoveUp(props: { actions: { chart: typeof chartActions }; chart: ChartParameters; close: () => void }) {
  const moveUp = React.useCallback(() => {
    props.actions.chart.moveChartUp({
      topic: props.chart.topic,
      dotPath: props.chart.dotPath,
    })
    props.close()
  }, [props.chart])

  return (
    <MenuItem key="size" onClick={moveUp}>
      <ListItemIcon>
        <ArrowUpward />
      </ListItemIcon>
      <Typography variant="inherit">Move up</Typography>
    </MenuItem>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    chart: bindActionCreators(chartActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(MoveUp)
