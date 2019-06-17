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
import { Paper, Theme, Typography, withStyles } from '@material-ui/core'
import { SettingsButton } from './ChartSettings/SettingsButton'
const throttle = require('lodash.throttle')

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
  usePollingToFetchTreeNode(treeNode, tree, parameters, setTreeNode)

  const onRemove = React.useCallback(() => {
    props.actions.chart.removeChart(props.parameters)
  }, [props.parameters])

  return (
    <Paper style={{ padding: '8px' }}>
      <div style={{ float: 'right' }}>
        <SettingsButton parameters={parameters} />
        <CustomIconButton tooltip="Remove chart" onClick={onRemove}>
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
      {treeNode ? (
        <TopicPlot
          color={props.parameters.color}
          interpolation={props.parameters.interpolation}
          range={props.parameters.range ? [props.parameters.range.from, props.parameters.range.to] : undefined}
          history={treeNode.messageHistory}
          dotPath={parameters.dotPath}
        />
      ) : (
        <span>No data</span>
      )}
    </Paper>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    tree: state.connection.tree,
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

/**
 * If a node is not available when the plot is shown, keep polling until it has been created
 */
function usePollingToFetchTreeNode(
  treeNode: q.TreeNode<any> | undefined,
  tree: q.Tree<any>,
  parameters: ChartParameters,
  setTreeNode: React.Dispatch<React.SetStateAction<q.TreeNode<any> | undefined>>
) {
  const [lastUpdate, setLastUpdate] = React.useState(0)

  function pollForTreeNode() {
    const onUpdateCallback = throttle(() => setLastUpdate(treeNode ? treeNode.lastUpdate : 0), 300)
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
}
