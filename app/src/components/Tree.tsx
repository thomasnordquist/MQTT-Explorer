import * as React from 'react'
import * as io from 'socket.io-client'
import * as q from '../../../backend/src/Model'
import TreeNode from './TreeNode'
import List from '@material-ui/core/List'

const throttle = require('lodash.throttle')

class TreeState {
  public tree: q.Tree
  public msg: any
  constructor(tree: q.Tree, msg: any) {
    this.tree = tree
    this.msg = msg
  }
}

export interface TreeNodeProps {
  didSelectNode?: (node: q.TreeNode) => void
}
declare const performance: any

export class Tree extends React.Component<TreeNodeProps, TreeState> {
  private socket: SocketIOClient.Socket
  private renderDuration: number = 200
  private updateTimer?: any
  private lastUpdate: number = 0
  private perf:number = 0

  constructor(props: any) {
    super(props)
    const tree = new q.Tree()
    this.state = new TreeState(tree, {})
    this.socket = io('http://localhost:3000')
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

    const updateInterval = Math.max(this.renderDuration * 5, 200)
    const timeUntilNextUpdate = updateInterval - (performance.now() - this.lastUpdate)

    this.updateTimer = setTimeout(() => {
      this.lastUpdate = performance.now()
      this.updateTimer && clearTimeout(this.updateTimer)
      this.updateTimer = undefined
      this.setState(state)
    }, Math.max(0, timeUntilNextUpdate))
  }

  public componentDidMount() {
    this.socket.on('message', (msg: any) => {
      const edges = msg.topic.split('/')
      const node = q.TreeNodeFactory.fromEdgesAndValue(edges, Buffer.from(msg.payload, 'base64').toString())
      this.state.tree.updateWithNode(node.firstNode())

      this.throttledStateUpdate({ msg, tree: this.state.tree })
    })
  }

  public componentWillUnmount() {
    this.socket.removeAllListeners()
  }

  public render() {
    return <div>
      <List>
        <TreeNode
          isRoot={true}
          didSelectNode={this.props.didSelectNode}
          treeNode={this.state.tree}
          name="/" collapsed={false}
          key="rootNode"
          performanceCallback={(ms: number) => {
            this.renderDuration = ms
          }}
        />
      </List>
    </div>
  }
}
