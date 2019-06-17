import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import TopicPlot from '../TopicPlot'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../actions'
import { ChartParameters } from '../../reducers/Charts'
import { connect } from 'react-redux'
import { Paper } from '@material-ui/core'
import ChartTitle from './ChartTitle'
import { ChartActions } from './ChartActions'
const throttle = require('lodash.throttle')

interface Props {
  parameters: ChartParameters
  treeNode?: q.TreeNode<any>
  actions: {
    chart: typeof chartActions
  }
}

/**
 * Subscribes to onMessage of treeNode
 */
function useMessageSubscriptionToUpdate(treeNode?: q.TreeNode<any>) {
  const [lastUpdated, setLastUpdate] = React.useState(0)
  function subscribeToMessageUpdates() {
    const onUpdateCallback = throttle(() => setLastUpdate(treeNode ? treeNode.lastUpdate : 0), 300)
    treeNode && treeNode.onMessage.subscribe(onUpdateCallback)

    return function cleanup() {
      treeNode && treeNode.onMessage.unsubscribe(onUpdateCallback)
    }
  }
  React.useEffect(subscribeToMessageUpdates, [treeNode])
}

function Chart(props: Props) {
  const { parameters, treeNode } = props
  const [freezedHistory, setHistory] = React.useState<q.MessageHistory | undefined>()
  useMessageSubscriptionToUpdate(treeNode)

  const togglePause = React.useCallback(() => {
    if (!props.treeNode) {
      return
    }
    setHistory(freezedHistory ? undefined : props.treeNode.messageHistory.clone())
  }, [props.treeNode, freezedHistory])

  const onRemove = React.useCallback(() => {
    props.actions.chart.removeChart(props.parameters)
  }, [props.parameters])

  return (
    <Paper style={{ padding: '8px' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <ChartTitle parameters={parameters} />
          <ChartActions
            parameters={parameters}
            onRemove={onRemove}
            paused={Boolean(freezedHistory)}
            togglePause={togglePause}
          />
        </div>
      </div>
      {props.treeNode ? (
        <TopicPlot
          color={props.parameters.color}
          interpolation={props.parameters.interpolation}
          range={props.parameters.range ? [props.parameters.range.from, props.parameters.range.to] : undefined}
          history={freezedHistory ? freezedHistory : props.treeNode.messageHistory}
          dotPath={parameters.dotPath}
        />
      ) : (
        <span>No data</span>
      )}
    </Paper>
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
)(Chart)
