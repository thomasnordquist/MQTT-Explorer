import * as React from 'react'
import { AppState } from '../../../reducers'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../../actions'
import { ChartParameters, PlotCurveTypes } from '../../../reducers/Charts'
import { connect } from 'react-redux'
import { Menu, MenuItem } from '@material-ui/core'

function chartParametersForAction(chart: ChartParameters, action: string) {
  return {
    topic: chart.topic,
    dotPath: chart.dotPath,
    interpolation: action as any,
  }
}

const curves: Array<PlotCurveTypes> = ['curve', 'linear', 'step_after', 'step_before', 'cubic_basis_spline']

function InterpolationSettings(props: {
  chart: ChartParameters
  actions: {
    chart: typeof chartActions
  }
  anchorEl?: Element
  open: boolean
  onClose: () => void
}) {
  const callbacks = React.useMemo(() => {
    const createCurveCallback = (curve: PlotCurveTypes) => () => {
      props.actions.chart.updateChart(chartParametersForAction(props.chart, curve))
    }

    const callbacks: { [key: string]: () => void } = {}
    for (const curve of curves) {
      callbacks[curve] = createCurveCallback(curve)
    }
    return callbacks
  }, [curves])

  const menuItems = React.useMemo(() => {
    return curves.map(curve => (
      <MenuItem key={curve} onClick={callbacks[curve]} selected={props.chart.interpolation === curve}>
        {curve.replace(/_/g, ' ')}
      </MenuItem>
    ))
  }, [curves, props.chart])

  return (
    <Menu id="long-menu" anchorEl={props.anchorEl} open={props.open} onClose={props.onClose}>
      {menuItems}
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
)(InterpolationSettings)
