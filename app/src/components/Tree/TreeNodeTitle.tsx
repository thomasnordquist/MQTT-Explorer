import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { treeActions } from '../../actions'
import * as q from '../../../../backend/src/Model'
import { withTheme, Theme } from '@material-ui/core/styles'

export interface TreeNodeProps extends React.HTMLAttributes<HTMLElement> {
  treeNode: q.TreeNode
  actions: any
  name?: string | undefined
  collapsed?: boolean | undefined
  theme: Theme
  lastUpdate: number
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

  private didSelectNode = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (this.props.treeNode.message) {
      this.props.actions.selectTopic(this.props.treeNode)
    }
  }

  public render() {
    const style: React.CSSProperties = {
      lineHeight: '1em',
      whiteSpace: 'nowrap',
    }
    return (
      <span style={style} onMouseOver={this.didSelectNode}>
        {this.renderExpander()} {this.renderSourceEdge()} {this.renderCollapsedSubnodes()} {this.renderValue()}
      </span>
    )
  }

  private renderSourceEdge() {
    const style: React.CSSProperties = {
      fontWeight: 'bold',
      overflow: 'hidden',
      display: 'inline-block',
    }
    const name = this.props.name || (this.props.treeNode.sourceEdge && this.props.treeNode.sourceEdge.name)

    return <span style={style}>{name}</span>
  }

  private renderValue() {
    const style: React.CSSProperties = {
      width: '15em',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      padding: '0',
      marginLeft: '5px',
      display: 'inline-block',
    }
    return this.props.treeNode.message
      ? <span style={style}> = {this.props.treeNode.message.value.toString()}</span>
      : null
  }

  private renderExpander() {
    if (this.props.treeNode.edgeCount() === 0) {
      return null
    }

    return this.props.collapsed ? '▶' : '▼'
  }

  private renderCollapsedSubnodes() {
    if (this.props.treeNode.edgeCount() === 0 || !this.props.collapsed) {
      return null
    }

    const messages = this.props.treeNode.leafMessageCount()
    return <span style={this.getStyles().collapsedSubnodes}>({this.props.treeNode.leafCount()} nodes, {messages} messages)</span>
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(treeActions, dispatch),
  }
}

export default withTheme()(connect(null, mapDispatchToProps)(TreeNodeTitle))
