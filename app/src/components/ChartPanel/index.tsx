import * as React from 'react'
import Chart from './Chart'
import ShowChart from '@material-ui/icons/ShowChart'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../actions'
import { ChartParameters } from '../../reducers/Charts'
import { connect } from 'react-redux'
import { Grid, Theme, Typography, withStyles } from '@material-ui/core'
import { List } from 'immutable'
const { TransitionGroup, CSSTransition } = require('react-transition-group/esm')

interface Props {
  charts: List<ChartParameters>
  connectionId?: string
  actions: {
    chart: typeof chartActions
  }
}

function spacingForChartCount(count: number): 4 | 6 | 12 {
  if (count >= 5) {
    return 4
  } else if (count >= 2) {
    return 6
  } else {
    return 12
  }
}

function mapWidth(width: 'big' | 'medium' | 'small' | undefined, calculatedSpacing: 4 | 6 | 12): 4 | 6 | 12 {
  switch (width) {
    case 'big':
      return 12
    case 'medium':
      return 6
    case 'small':
      return 4
    default:
      return calculatedSpacing
  }
}

function ChartPanel(props: Props) {
  const chartsInView = props.charts.count()

  const [spacing, setSpacing] = React.useState(spacingForChartCount(chartsInView))

  React.useEffect(() => {
    props.actions.chart.loadCharts()
  }, [props.connectionId])

  // Update spacing after animations have completed
  React.useEffect(() => {
    const newSpacing = spacingForChartCount(chartsInView)
    if (newSpacing > spacing) {
      setTimeout(() => setSpacing(newSpacing), 500)
    } else {
      setSpacing(newSpacing)
    }
  }, [chartsInView])

  const charts = props.charts.map(chartParameters => (
    <CSSTransition
      key={`${chartParameters.topic}-${chartParameters.dotPath || ''}`}
      timeout={{ enter: 500, exit: 500 }}
      classNames="example"
    >
      <Grid item xs={mapWidth(chartParameters.width, spacing)}>
        <Chart parameters={chartParameters} />
      </Grid>
    </CSSTransition>
  ))

  return (
    <div style={{ width: '100%', height: '100%', padding: '8px', flex: 1, overflow: 'hidden scroll' }}>
      <Grid container spacing={1}>
        <TransitionGroup component={null} className="example">
          {charts}
        </TransitionGroup>
        {chartsInView === 0 ? <NoCharts key="noCharts" /> : null}
      </Grid>
    </div>
  )
}

function NoCharts() {
  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <Typography variant="h2">No charts selected</Typography>
      <Typography>Select a numeric values from the value preview.</Typography>
      <Typography>
        Click on <ShowChart /> to add a topic / value to this panel.
      </Typography>
    </div>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    charts: state.charts.get('charts'),
    connectionId: state.connection.connectionId,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      chart: bindActionCreators(chartActions, dispatch),
    },
  }
}

const styles = (theme: Theme) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ChartPanel))
