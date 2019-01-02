import * as React from "react";
import * as q from '../../../backend/src/Model'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';

export interface TreeNodeProps {
  treeNode: q.TreeNode,
  name?: string | undefined
  collapsed?: boolean | undefined
  performanceCallback?: ((ms: number) => void) | undefined
  didSelectNode?: (node: q.TreeNode) => void
}

interface TreeNodeState {
  title: string | undefined,
  collapsed: boolean,
  collapsedOverride: boolean | undefined,
  edgeCount: number
}

let collapseLimit = 0
declare var performance: any

export class TreeNode extends React.Component<TreeNodeProps, TreeNodeState> {
  private dirty: boolean = true
  private willUpdateTime: number = performance.now()

  constructor(props: TreeNodeProps, state: TreeNodeState) {
    super(props, state)

    let edgeCount = Object.keys(props.treeNode.edges).length
    let collapsed = edgeCount > collapseLimit

    this.props.treeNode.on('update', () => {
      this.dirty = true
    })

    this.state = {collapsed, edgeCount: edgeCount, collapsedOverride: props.collapsed, title: props.name}
  }

  public setState(state: any) {
    this.dirty = true
    super.setState(state)
  }

  public shouldComponentUpdate() {
    return this.dirty
  }

  public componentDidUpdate() {
    this.dirty = false
    if (this.props.performanceCallback) {
      let renderTime = performance.now()-this.willUpdateTime
      this.props.performanceCallback(renderTime)
    }
  }

  public componentWillUpdate() {
    if (this.props.performanceCallback) {
      this.willUpdateTime = performance.now()
    }
  }

  private collapsed() {
    if (this.state.collapsedOverride !== undefined) {
      return this.state.collapsedOverride
    }

    return this.state.collapsed
  }

  private renderNodes() {
    const edges = Object.values(this.props.treeNode.edges)
    const listItemStyle = {
      padding: '3px 8px 3px 8px'
    }
    const listStyle = {
      padding: '3px 8px 3px 16px'
    }

    if (edges.length > 0) {
      const listItems = edges
        .map(edge => edge.target)
        .map(node => <ListItem style={listItemStyle} button key={node.hash()}>
          <TreeNode didSelectNode={this.props.didSelectNode} treeNode={node} />
        </ListItem>)

      return <Collapse in={!this.collapsed()} timeout="auto" unmountOnExit>
        <List style={listStyle}>{listItems}</List>
      </Collapse>
    }
  }

  private renderSourceEdge() {
    const style: React.CSSProperties = {
      fontWeight: "bold",
      overflow: 'hidden',
      display: 'inline-block',
    }
    let name = this.state.title || (this.props.treeNode.sourceEdge && this.props.treeNode.sourceEdge.name)

    return <span style={style} onClick={() => this.toggle()}>{name}</span>
  }

  private getStyle(): React.CSSProperties {
    return {
      display: 'block',
    }
  }

  public componentWillReceiveProps() {
    let edgeCount = Object.keys(this.props.treeNode.edges).length
    this.setState({collapsed: edgeCount > collapseLimit, edgeCount: edgeCount})
  }

  private renderValue() {
    const style: React.CSSProperties = {
      width: "15em",
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      padding: '0',
      paddingLeft: '5px',
      display: 'inline-block',
    }
    return this.props.treeNode.message
      ? <span
          style={style}
          onMouseOver={() => this.props.didSelectNode && this.props.didSelectNode(this.props.treeNode)}
          > = {this.props.treeNode.message.toString()}</span>
      : null
  }

  private clear() {
    return <div style={{clear: 'both'}} />
  }

  private renderTitleLine() {
    const style = {
      lineHeight: '1em'
    }
    return <div style={style}>{this.renderExpander()} {this.renderSourceEdge()} {this.renderCollapsedSubnodes()} {this.renderValue()}</div>
  }

  public render() {
    const nodeStyle: React.CSSProperties = {
      display: 'block',
    }

    return <div style={this.getStyle()}>
      {this.renderTitleLine()}
      <div style={nodeStyle}>
        {this.clear()}
        <div style={this.subnodesStyle()}>
          {this.collapsed() ? null : this.renderNodes()}
        </div>
      </div>
    </div>
  }

  private toggle() {
    this.setState({collapsedOverride: !this.collapsed()})
  }

  private renderExpander() {
    if (this.state.edgeCount === 0) {
      return null
    }

    return this.collapsed()
      ? <span onClick={() => this.toggle()}>▶</span>
      : <span onClick={() => this.toggle()}>▼</span>
  }

  private renderCollapsedSubnodes() {
    if (this.state.edgeCount === 0 || !this.collapsed()) {
      return null
    }

    let style = {
      color: '#333'
    }
    return <span style={style}>({this.props.treeNode.leafes().length} nodes)</span>
  }

  private subnodesStyle(): React.CSSProperties {
    return {
      display: 'block',
    }
  }
}
