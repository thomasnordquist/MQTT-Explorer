import * as React from 'react'
import { ChartParameters } from '../../../reducers/Charts'
import { Menu, MenuItem, TextField, Typography } from '@material-ui/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../../actions'

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
      Move up
    </MenuItem>
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
)(MoveUp)
