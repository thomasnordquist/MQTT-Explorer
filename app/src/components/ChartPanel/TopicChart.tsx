import * as q from '../../../../backend/src/Model'
import React, { useState } from 'react'
import TopicPlot from '../TopicPlot'
import { bindActionCreators } from 'redux'
import { chartActions } from '../../actions'
import { ChartParameters } from '../../reducers/Charts'
import { connect } from 'react-redux'
import { Paper } from '@material-ui/core'
import ChartTitle from './ChartTitle'
import { ChartActions } from './ChartActions'
import { RingBuffer } from '../../../../backend/src/Model'
const throttle = require('lodash.throttle')

interface Props {
  parameters: ChartParameters
  treeNode?: q.TreeNode<any>
  actions: {
    chart: typeof chartActions
  }
}

/**
 * Subscribes to onMessages, stores more data points then the default
 */
function useMessageSubscriptionToUpdate(treeNode?: q.TreeNode<any>) {
  const [lastUpdated, setLastUpdate] = useState(0)
  const [messageHistory, setMessageHistory] = useState<q.MessageHistory | undefined>()
  let amendMessageCallback: any

  function subscribeToMessageUpdates() {
    const throttledUpdate = throttle(() => setLastUpdate(treeNode ? treeNode.lastUpdate : 0), 300)

    if (treeNode) {
      const newMessageHistory = treeNode.messageHistory.clone()
      newMessageHistory.setCapacity(500, 2 * 500 * 10000)

      amendMessageCallback = (message: q.Message) => {
        newMessageHistory.add(message)
        throttledUpdate()
      }
      treeNode.onMessage.subscribe(amendMessageCallback)
      setMessageHistory(newMessageHistory)
    }

    return function cleanup() {
      treeNode && treeNode.onMessage.unsubscribe(amendMessageCallback)
    }
  }
  React.useEffect(subscribeToMessageUpdates, [treeNode])

  return messageHistory
}

function TopicChart(props: Props) {
  const { parameters, treeNode } = props
  const [frozenHistory, setFrozenHistory] = React.useState<q.MessageHistory | undefined>()
  const messageHistory = useMessageSubscriptionToUpdate(treeNode)

  const togglePause = React.useCallback(() => {
    if (!treeNode) {
      return
    }

    setFrozenHistory(frozenHistory ? undefined : messageHistory && messageHistory.clone())
  }, [props.treeNode, frozenHistory, messageHistory])

  const onRemove = React.useCallback(() => {
    props.actions.chart.removeChart(props.parameters)
  }, [props.parameters])

  return (
    <Paper
      style={{ padding: '8px' }}
      data-test-type="ChartPaper"
      data-test={`${props.parameters.topic}-${props.parameters.dotPath || ''}`}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <ChartTitle parameters={parameters} />
          <ChartActions
            parameters={parameters}
            onRemove={onRemove}
            paused={Boolean(frozenHistory)}
            togglePause={togglePause}
          />
        </div>
      </div>
      <TopicPlot
        color={props.parameters.color}
        interpolation={props.parameters.interpolation}
        timeInterval={props.parameters.timeRange ? props.parameters.timeRange.until : undefined}
        range={props.parameters.range ? [props.parameters.range.from, props.parameters.range.to] : undefined}
        history={frozenHistory || messageHistory || new RingBuffer<q.Message>(1)}
        dotPath={parameters.dotPath}
      />
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
)(TopicChart)
