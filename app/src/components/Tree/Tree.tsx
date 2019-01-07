import * as React from 'react'
import * as q from '../../../../backend/src/Model'
import TreeNode from './TreeNode'
import { Typography } from '@material-ui/core'
import { makeConnectionMessageEvent, rendererEvents } from '../../../../events'
import {  } from '../../../../events/Events'
const MovingAvaerage = require('moving-average')
import { connect } from 'react-redux'
import { AppState } from '../../reducers'

declare const performance: any

const timeInterval = 10 * 1000
const average = MovingAvaerage(timeInterval)

interface Props {
  autoExpandLimit: number
  didSelectNode?: (node: q.TreeNode) => void
  connectionId?: string
}

interface TreeState {
  tree: q.Tree
  msg: any
}

class Tree extends React.Component<Props, TreeState> {
  private renderDuration: number = 300
  private updateTimer?: any
  private lastUpdate: number = 0
  private perf: number = 0

  constructor(props: any) {
    super(props)
    const tree = new q.Tree()
    this.state = { tree, msg: {} }
  }

  public time(): number {
    const time = performance.now() - this.perf
    this.perf = performance.now()

    return time
  }

  public throttledStateUpdate(state: any) {
    if (this.updateTimer) {
      return
    }

    const expectedRenderTime = average.forecast()
    const updateInterval = Math.max(expectedRenderTime * 5, 300)
    const timeUntilNextUpdate = updateInterval - (performance.now() - this.lastUpdate)

    this.updateTimer = setTimeout(() => {
      this.lastUpdate = performance.now()
      this.updateTimer && clearTimeout(this.updateTimer)
      this.updateTimer = undefined
      this.setState(state)
    }, Math.max(0, timeUntilNextUpdate))
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.connectionId) {
      const event = makeConnectionMessageEvent(this.props.connectionId)
      rendererEvents.unsubscribeAll(event)
    }
    if (nextProps.connectionId) {
      const event = makeConnectionMessageEvent(nextProps.connectionId)
      rendererEvents.subscribe(event, this.handleNewData)
    }
  }

  public componentDidMount() {
    if (this.props.connectionId) {
      const event = makeConnectionMessageEvent(this.props.connectionId)
      rendererEvents.subscribe(event, this.handleNewData)
    }
  }

  public componentWillUnmount() {
    if (this.props.connectionId) {
      const event = makeConnectionMessageEvent(this.props.connectionId)
      rendererEvents.unsubscribeAll(event)
    }
  }

  private handleNewData = (msg: any) => {
    const edges = msg.topic.split('/')
    const node = q.TreeNodeFactory.fromEdgesAndValue(edges, Buffer.from(msg.payload, 'base64').toString())
    this.state.tree.updateWithNode(node.firstNode())

    this.throttledStateUpdate({ msg, tree: this.state.tree })
  }

  public render() {
    const style: React.CSSProperties = {
      lineHeight: '1.1',
      cursor: 'default',
    }

    return <Typography style={ style }>
        <TreeNode
          animateChages = { true }
          autoExpandLimit = { this.props.autoExpandLimit }
          isRoot = { true }
          didSelectNode = { this.props.didSelectNode }
          treeNode = { this.state.tree }
          name = "/"
          collapsed = { false }
          key="rootNode"
          performanceCallback={(ms: number) => {
            average.push(Date.now(), ms)
            this.renderDuration = ms
          }}
        />
    </Typography>
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    autoExpandLimit: state.settings.autoExpandLimit,
  }
}

export default connect(mapStateToProps)(Tree)
