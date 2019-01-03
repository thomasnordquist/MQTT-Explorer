import * as React from 'react'
import * as q from '../../../backend/src/Model'
import { List, ListItem, Collapse, Typography } from '@material-ui/core'
import { withTheme, Theme } from '@material-ui/core/styles'
const throttle = require('lodash.throttle')
import Slide from '@material-ui/core/Slide'
import { isElementInViewport } from './helper/isElementInViewport'
const collapseLimit = 3
declare var performance: any

export interface TreeNodeProps {
  isRoot?: boolean
  treeNode: q.TreeNode
  name?: string | undefined
  collapsed?: boolean | undefined
  performanceCallback?: ((ms: number) => void) | undefined
  didSelectNode?: (node: q.TreeNode) => void
  theme: Theme
}

interface TreeNodeState {
  title: string | undefined
  collapsed: boolean
  collapsedOverride: boolean | undefined
  edgeCount: number
}

class TreeNode extends React.Component<TreeNodeProps, TreeNodeState> {
  private dirty: boolean = true
  private willUpdateTime: number = performance.now()
  private titleRef = React.createRef<HTMLElement>()
  private markAsDirty = () => {
    this.dirty = true
    if (!this.props.isRoot) {
      this.indicateUpdate()
    }
  }

  private indicateUpdate = throttle(() => {
    const title: any = this.titleRef.current
    if (title && isElementInViewport(title)) {
      title.style.animation = 'example 0.5s'
      setTimeout(() => {
        title.style.animation = ''
      }, 500)
    }
  }, 500)

  constructor(props: TreeNodeProps) {
    super(props)
    const edgeCount = Object.keys(props.treeNode.edges).length
    const collapsed = edgeCount > collapseLimit
    this.state = { collapsed, edgeCount, collapsedOverride: props.collapsed, title: props.name }
  }

  public componentDidMount() {
    this.props.treeNode.on('update', this.markAsDirty)
  }

  public componentWillUnmount() {
    this.props.treeNode.removeListener('update', this.markAsDirty)
  }

  private getStyles() {
    const { theme } = this.props
    return {
      collapsedSubnodes: {
        color: theme.palette.text.secondary,
      },
      container: {
        display: 'block',
      },
    }
  }

  public setState(state: any) {
    this.dirty = this.state.collapsed !== state.collapsed
      || this.state.collapsedOverride !== state.collapsedOverride
      || this.state.edgeCount !== state.edgeCount

    super.setState(state)
  }

  public shouldComponentUpdate() {
    return this.dirty
  }

  public componentDidUpdate() {
    if (this.props.performanceCallback) {
      const renderTime = performance.now() - this.willUpdateTime
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
      padding: '3px 8px 0px 8px',
    }

    const listStyle = {
      padding: '3px 8px 0px 16px',
    }

    if (edges.length > 0) {
      const listItems = edges
        .map(edge => edge.target)
        .map(node => (
          <ListItem key={node.hash()} style={listItemStyle} button>
            <TreeNode
              theme={this.props.theme}
              didSelectNode={this.props.didSelectNode}
              treeNode={node}
              />
          </ListItem>
        ))

      return <Collapse in={!this.collapsed()} timeout="auto" unmountOnExit>
        <List style={listStyle}>{listItems}</List>
      </Collapse>
    }
  }

  private renderSourceEdge() {
    const style: React.CSSProperties = {
      fontWeight: 'bold',
      overflow: 'hidden',
      display: 'inline-block',
    }
    const name = this.state.title || (this.props.treeNode.sourceEdge && this.props.treeNode.sourceEdge.name)

    return <span style={style} onClick={() => {
      this.toggle()
      this.props.didSelectNode && this.props.didSelectNode(this.props.treeNode)
    }>{name}</span>
  }

  public componentWillReceiveProps() {
    const edgeCount = Object.keys(this.props.treeNode.edges).length
    this.setState({ edgeCount, collapsed: edgeCount > collapseLimit })
  }

  private renderValue() {
    const style: React.CSSProperties = {
      width: '15em',
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
          > = {this.props.treeNode.message.value.toString()}</span>
      : null
  }

  private clear() {
    return <div style={{ clear: 'both' }} />
  }

  private renderTitleLine() {
    const style: React.CSSProperties = {
      lineHeight: '1em',
      whiteSpace: 'nowrap',
      width: '15em',
    }
    return <div
      ref={this.titleRef}
    >
      <Typography style={style}>
        {this.renderExpander()} {this.renderSourceEdge()} {this.renderCollapsedSubnodes()} {this.renderValue()}
      </Typography>
    </div>
  }

  public render() {
    this.dirty = false

    const nodeStyle: React.CSSProperties = {
      display: 'block',
    }

    return <div key={this.props.treeNode.hash()} style={ this.getStyles().container }>
      { this.renderTitleLine() }
      <div style = { nodeStyle }>
        { this.clear() }
        <div style = { this.subnodesStyle() }>
          { this.collapsed() ? null : this.renderNodes() }
        </div>
      </div>
    </div>
  }

  private toggle() {
    this.setState({ collapsedOverride: !this.collapsed() })
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

    const messages = this.props.treeNode.leafes().map(leaf => leaf.messages).reduce((a, b) => a + b)
    return <span style={this.getStyles().collapsedSubnodes}>({this.props.treeNode.leafes().length} nodes, {messages} messages)</span>
  }

  private subnodesStyle(): React.CSSProperties {
    return {
      display: 'block',
    }
  }
}

export default withTheme()(TreeNode)
