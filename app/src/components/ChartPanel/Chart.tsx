import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import Clear from '@material-ui/icons/Clear'
import CustomIconButton from '../helper/CustomIconButton'
import TopicPlot from '../TopicPlot'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../actions'
import { ChartParameters } from '../../reducers/Charts'
import { connect } from 'react-redux'
import { Paper, Theme, Typography, withStyles, Fade } from '@material-ui/core'

interface Props {
  parameters: ChartParameters
  tree?: q.Tree<any>
  classes: any
  actions: {
    chart: typeof chartActions
  }
}

function Chart(props: Props) {
  if (!props.tree) {
    return null
  }

  const { tree, parameters } = props
  const initialTreeNode = tree.findNode(parameters.topic)
  const [treeNode, setTreeNode] = React.useState<q.TreeNode<any> | undefined>(initialTreeNode)
  const [lastUpdate, setLastUpdate] = React.useState(0)

  /** If a node is not available when the plot is shown, keep polling until it has been created */
  function pollForTreeNode() {
    const onUpdateCallback = () => setLastUpdate(treeNode ? treeNode.lastUpdate : 0)
    let intervalTimer: any

    if (!treeNode) {
      intervalTimer = setInterval(() => {
        const node = tree.findNode(parameters.topic)
        if (node) {
          setTreeNode(node)
          node.onMessage.subscribe(onUpdateCallback)
          clearInterval(intervalTimer)
        }
      }, 500)
    } else {
      treeNode.onMessage.subscribe(onUpdateCallback)
    }

    return function cleanup() {
      treeNode && treeNode.onMessage.unsubscribe(onUpdateCallback)
      intervalTimer && clearInterval(intervalTimer)
    }
  }
  React.useEffect(pollForTreeNode)

  const onClick = React.useCallback(() => {
    props.actions.chart.removeChart(props.parameters)
  }, [props.parameters])

  return (
    <Paper style={{ padding: '8px' }}>
      <div style={{ float: 'right' }}>
        <CustomIconButton tooltip="Remove chart" onClick={onClick}>
          <Clear />
        </CustomIconButton>
      </div>
      <Typography variant="caption" className={props.classes.topic}>
        {parameters.dotPath ? parameters.dotPath : ''}
      </Typography>
      <br />
      <Typography variant="caption" className={props.classes.topic}>
        {parameters.topic}
      </Typography>
      <br />
      {treeNode ? <TopicPlot history={treeNode.messageHistory} dotPath={parameters.dotPath} /> : <span>No data</span>}
    </Paper>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    tree: state.tree.get('tree'),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      chart: bindActionCreators(chartActions, dispatch),
    },
  }
}

const styles = (theme: Theme) => ({
  topic: {
    wordBreak: 'break-all' as 'break-all',
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    textOverflow: 'ellipsis' as 'ellipsis',
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Chart))
