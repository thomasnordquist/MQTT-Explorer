import * as React from 'react'
import * as q from '../../../../backend/src/Model'

import { makeConnectionMessageEvent, rendererEvents, MqttMessage } from '../../../../events'

import { AppState } from '../../reducers'
import TreeNode from './TreeNode'
import { connect } from 'react-redux'

const MovingAverage = require('moving-average')

const timeInterval = 10 * 1000
const average = MovingAverage(timeInterval)

declare var window: any

interface Props {
  autoExpandLimit: number
  didSelectNode?: (node: q.TreeNode) => void
  connectionId?: string
  connected: boolean
}

interface TreeState {
  tree: q.Tree
  msg: any
}

class Tree extends React.Component<Props, TreeState> {
  private updateTimer?: any
  private lastUpdate: number = 0
  private perf: number = 0

  constructor(props: any) {
    super(props)
    this.state = { tree: new q.Tree(), msg: {} }
  }

  public time(): number {
    const time = performance.now() - this.perf
    this.perf = performance.now()

    return time
  }

  private performanceCallback = (ms: number) => {
    average.push(Date.now(), ms)
  }

  public throttledStateUpdate(state: any) {
    if (this.updateTimer) {
      return
    }

    const expectedRenderTime = average.forecast()
    const updateInterval = Math.max(expectedRenderTime * 7, 300)
    const timeUntilNextUpdate = updateInterval - (performance.now() - this.lastUpdate)

    this.updateTimer = setTimeout(() => {
      window.requestIdleCallback(() => {
        this.lastUpdate = performance.now()
        this.updateTimer && clearTimeout(this.updateTimer)
        this.updateTimer = undefined
        this.setState(state)
      }, { timeout: 500 })
    }, Math.max(0, timeUntilNextUpdate))
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.registerAndUnregisterEventSubscriptionsForNewProps(nextProps)
  }

  private registerAndUnregisterEventSubscriptionsForNewProps(nextProps: Props) {
    if (this.props.connectionId !== nextProps.connectionId) {
      if (this.props.connectionId) {
        this.setState({ tree: new q.Tree() })
        rendererEvents.unsubscribeAll(makeConnectionMessageEvent(this.props.connectionId))
      }
      if (nextProps.connectionId) {
        rendererEvents.subscribe(makeConnectionMessageEvent(nextProps.connectionId), this.handleNewData)
      }
    }
  }

  public componentWillUnmount() {
    if (this.props.connectionId) {
      const event = makeConnectionMessageEvent(this.props.connectionId)
      rendererEvents.unsubscribeAll(event)
    }
  }

  private handleNewData = (msg: MqttMessage) => {
    const edges = msg.topic.split('/')
    const node = q.TreeNodeFactory.fromEdgesAndValue(edges, msg.payload)
    node.mqttMessage = msg
    this.state.tree.updateWithNode(node.firstNode())

    this.throttledStateUpdate({ msg, tree: this.state.tree })
  }

  public render() {
    if (!this.props.connected) {
      return null
    }

    const style: React.CSSProperties = {
      lineHeight: '1.1',
      cursor: 'default',
    }

    return (
      <div style={style}>
        <TreeNode
          animateChages={true}
          autoExpandLimit={this.props.autoExpandLimit}
          isRoot={true}
          didSelectNode={this.props.didSelectNode}
          treeNode={this.state.tree}
          name="/"
          collapsed={false}
          key="rootNode"
          lastUpdate={this.state.tree.lastUpdate}
          performanceCallback={this.performanceCallback}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    autoExpandLimit: state.tooBigReducer.settings.autoExpandLimit,
    connected: state.tooBigReducer.connected,
  }
}

export default connect(mapStateToProps)(Tree)
