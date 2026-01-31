import React, { useState, useCallback, memo, useRef } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Paper } from '@mui/material'
import * as q from '../../../../backend/src/Model'
import ChartTitle from './ChartTitle'
import TopicPlot from '../TopicPlot'
import { ChartActions } from './ChartActions'
import { chartActions } from '../../actions'
import { ChartParameters } from '../../reducers/Charts'

const throttle = require('lodash.throttle')

class ClearableMessageBuffer extends q.RingBuffer<q.Message> {
  public clear() {
    this.items = []
    this.start = 0
    this.end = 0
  }

  public static fromMessageBuffer(buffer: q.RingBuffer<q.Message>): ClearableMessageBuffer {
    return new ClearableMessageBuffer(buffer.capacity, buffer.maxItems, buffer.compactionFactor, buffer)
  }

  public clone(): ClearableMessageBuffer {
    return ClearableMessageBuffer.fromMessageBuffer(this)
  }
}

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
  const [messageHistory, setMessageHistory] = useState<ClearableMessageBuffer | undefined>()
  let amendMessageCallback: any

  function subscribeToMessageUpdates() {
    const throttledUpdate = throttle(() => setLastUpdate(treeNode ? treeNode.lastUpdate : 0), 300)

    if (treeNode) {
      const newMessageHistory = ClearableMessageBuffer.fromMessageBuffer(treeNode.messageHistory)
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
      setMessageHistory(undefined)
    }
  }
  React.useEffect(subscribeToMessageUpdates, [treeNode])

  return messageHistory
}

function useResetDataCallback(messageHistory: ClearableMessageBuffer | undefined) {
  const [lastUpdated, setLastUpdate] = useState(0)

  return React.useCallback(() => {
    messageHistory && messageHistory.clear()
    setLastUpdate(Date.now())
  }, [messageHistory])
}

function TopicChart(props: Props) {
  const { parameters, treeNode } = props
  const [frozenHistory, setFrozenHistory] = useState<q.MessageHistory | undefined>()
  const messageHistory = useMessageSubscriptionToUpdate(treeNode)

  const togglePause = useCallback(() => {
    if (!treeNode) {
      return
    }

    setFrozenHistory(frozenHistory ? undefined : messageHistory && messageHistory.clone())
  }, [props.treeNode, frozenHistory, messageHistory])

  const onRemove = React.useCallback(() => {
    props.actions.chart.removeChart(props.parameters)
  }, [props.parameters])

  const resetData = useResetDataCallback(messageHistory)

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
            resetDataAction={resetData}
            parameters={parameters}
            onRemove={onRemove}
            paused={Boolean(frozenHistory)}
            togglePause={togglePause}
          />
        </div>
      </div>
      <TopicPlot
        node={props.treeNode ? props.treeNode : undefined}
        color={props.parameters.color}
        interpolation={props.parameters.interpolation}
        timeInterval={props.parameters.timeRange ? props.parameters.timeRange.until : undefined}
        range={props.parameters.range ? [props.parameters.range.from, props.parameters.range.to] : undefined}
        history={frozenHistory || messageHistory || new ClearableMessageBuffer(1)}
        dotPath={parameters.dotPath}
      />
    </Paper>
  )
}

const mapDispatchToProps = (dispatch: any) => ({
  actions: {
    chart: bindActionCreators(chartActions, dispatch),
  },
})

export default connect(undefined, mapDispatchToProps)(memo(TopicChart))
