import * as React from 'react'
import ShowChart from '@mui/icons-material/ShowChart'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Grid, Typography } from '@mui/material'
import { withStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import { List } from 'immutable'
import * as q from '../../../../backend/src/Model'
import { AppState } from '../../reducers'
import { ChartWithTreeNode } from './ChartWithTreeNode'
import { ChartParameters } from '../../reducers/Charts'
import { chartActions } from '../../actions'

const { TransitionGroup, CSSTransition } = require('react-transition-group/esm')

interface Props {
  charts: List<ChartParameters>
  connectionId?: string
  tree?: q.Tree<any>
  actions: {
    chart: typeof chartActions
  }
  classes: any
}

function spacingForChartCount(count: number): 4 | 6 | 12 {
  if (count >= 5) {
    return 4
  }
  if (count >= 2) {
    return 6
  }
  return 12
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

// Helper function to generate unique keys for charts
const getChartKey = (chart: ChartParameters) => `${chart.topic}-${chart.dotPath || ''}`

function ChartPanel(props: Props) {
  const chartsInView = props.charts.count()

  const [spacing, setSpacing] = React.useState(spacingForChartCount(chartsInView))
  const nodeRefsMap = React.useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map())

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

  // Clean up refs for removed charts
  React.useEffect(() => {
    const currentKeys = new Set(props.charts.map(getChartKey).toArray())
    const refsToDelete: string[] = []

    nodeRefsMap.current.forEach((_, key) => {
      if (!currentKeys.has(key)) {
        refsToDelete.push(key)
      }
    })

    refsToDelete.forEach(key => nodeRefsMap.current.delete(key))
  }, [props.charts])

  const charts = props.charts.map(chartParameters => {
    const key = getChartKey(chartParameters)

    // Get or create a ref for this specific chart
    if (!nodeRefsMap.current.has(key)) {
      nodeRefsMap.current.set(key, React.createRef<HTMLDivElement>())
    }
    const nodeRef = nodeRefsMap.current.get(key)!

    return (
      <CSSTransition key={key} timeout={{ enter: 500, exit: 500 }} classNames="example" nodeRef={nodeRef}>
        <Grid item xs={mapWidth(chartParameters.width, spacing)} ref={nodeRef}>
          <ChartWithTreeNode tree={props.tree} parameters={chartParameters} />
        </Grid>
      </CSSTransition>
    )
  })

  return (
    <div className={props.classes.container}>
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

const mapStateToProps = (state: AppState) => ({
  charts: state.charts.get('charts'),
  connectionId: state.connection.connectionId,
  tree: state.connection.tree,
})

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    chart: bindActionCreators(chartActions, dispatch),
  },
})

const styles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    height: '100%',
    padding: '8px',
    flex: 1,
    overflow: 'auto',
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ChartPanel) as any)
