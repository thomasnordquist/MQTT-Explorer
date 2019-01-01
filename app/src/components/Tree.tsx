import * as React from "react";
import * as io from 'socket.io-client';
import * as q from '../../../src/Model'
import { TreeNode } from './TreeNode'
import List from '@material-ui/core/List';

var throttle = require('lodash.throttle');

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

export class Tree extends React.Component<TreeNodeProps, TreeState> {
  private socket: SocketIOClient.Socket
  private renderDuration: number = 300

  constructor(props: any) {
    super(props);
    let tree = new q.Tree()
    this.state = new TreeState(tree, {})
    this.socket = io('http://localhost:3000');
  }

  public componentDidMount() {
    let updateState = throttle((state: any) => {
      this.setState(state)
      updateState.cancel()
      updateState = throttle(() => {
        this.setState(state)
      }, Math.max(this.renderDuration * 5, 300), {trailing: true})
    }, 1000)

    this.socket.on('message', (msg: any) => {
      const edges = msg.topic.split('/')
      const node = q.TreeNodeFactory.fromEdgesAndValue(edges, Buffer.from(msg.payload, "base64").toString())
      this.state.tree.updateWithNode(node.firstNode())

      updateState({tree: this.state.tree, msg: msg})
    })
  }

  public componentWillUnmount() {
    this.socket.removeAllListeners()
  }

  private getStyle(): {[s: string]: any} {
    return {
      marginTop: '64px'
    }
  }

  public render() {
    return <div {...this.props}>
        <List style={this.getStyle()}>
          <TreeNode
            didSelectNode={this.props.didSelectNode}
            treeNode={this.state.tree}
            name="/" collapsed={false}
            performanceCallback={(ms) => this.renderDuration = ms}
            />
      </List>
    </div>;
  }
}
