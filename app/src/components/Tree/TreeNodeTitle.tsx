import * as React from 'react'
import * as q from '../../../../backend/src/Model'
import { Typography } from '@material-ui/core'
import { withTheme, Theme } from '@material-ui/core/styles'

export interface TreeNodeProps {
  treeNode: q.TreeNode
  name?: string | undefined
  collapsed?: boolean | undefined
  toggleCollapsed: () => void
  didSelectNode?: (node: q.TreeNode) => void
  edgeCount: number
  theme: Theme
}

class TreeNodeTitle extends React.Component<TreeNodeProps, {}> {
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

  public render() {
    const style: React.CSSProperties = {
      lineHeight: '1em',
      whiteSpace: 'nowrap',
    }
    return <Typography style={style}>
      {this.renderExpander()} {this.renderSourceEdge()} {this.renderCollapsedSubnodes()} {this.renderValue()}
    </Typography>
  }

  private renderSourceEdge() {
    const style: React.CSSProperties = {
      fontWeight: 'bold',
      overflow: 'hidden',
      display: 'inline-block',
    }
    const name = this.props.name || (this.props.treeNode.sourceEdge && this.props.treeNode.sourceEdge.name)

    return <span style={style} onClick={() => {
      this.toggle()
      this.props.didSelectNode && this.props.didSelectNode(this.props.treeNode)
    }}>{name}</span>
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

  private toggle() {
    this.props.toggleCollapsed()
  }

  private renderExpander() {
    if (this.props.edgeCount === 0) {
      return null
    }

    return this.props.collapsed
      ? <span onClick={() => this.toggle()}>▶</span>
      : <span onClick={() => this.toggle()}>▼</span>
  }

  private renderCollapsedSubnodes() {
    if (this.props.edgeCount === 0 || !this.props.collapsed) {
      return null
    }

    const messages = this.props.treeNode.leafes().map(leaf => leaf.messages).reduce((a, b) => a + b)
    return <span style={this.getStyles().collapsedSubnodes}>({this.props.treeNode.leafes().length} nodes, {messages} messages)</span>
  }
}

export default withTheme()(TreeNodeTitle)
