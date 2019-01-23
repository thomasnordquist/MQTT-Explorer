import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { treeActions } from '../../actions'
import * as q from '../../../../backend/src/Model'
import { withStyles, Theme } from '@material-ui/core'

export interface TreeNodeProps extends React.HTMLAttributes<HTMLElement> {
  treeNode: q.TreeNode
  actions: any
  name?: string | undefined
  collapsed?: boolean | undefined
  lastUpdate: number
  classes: any
}

class TreeNodeTitle extends React.Component<TreeNodeProps, {}> {
  private mouseOver = (event: React.MouseEvent) => {
    if (this.props.treeNode.message) {
      this.props.actions.selectTopic(this.props.treeNode)
    }
  }

  public render() {
    return (
      <span className={this.props.classes.title} onMouseOver={this.mouseOver}>
        {this.renderExpander()} {this.renderSourceEdge()} {this.renderCollapsedSubnodes()} {this.renderValue()}
      </span>
    )
  }

  private renderSourceEdge() {
    const name = this.props.name || (this.props.treeNode.sourceEdge && this.props.treeNode.sourceEdge.name)

    return <span className={this.props.classes.sourceEdge}>{name}</span>
  }

  private renderValue() {
    return this.props.treeNode.message && this.props.treeNode.message.length > 0
      ? <span className={this.props.classes.value}> = {this.props.treeNode.message.value.toString().slice(0, 120)}</span>
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
    return <span className={this.props.classes.collapsedSubnodes}>({this.props.treeNode.childTopicCount()} topics, {messages} messages)</span>
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(treeActions, dispatch),
  }
}

const styles = (theme: Theme) => ({
  value: {
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    textOverflow: 'ellipsis' as 'ellipsis',
    padding: '0',
    marginLeft: '5px',
    display: 'inline-block' as 'inline-block',
  },
  sourceEdge: {
    fontWeight: 'bold' as 'bold',
    overflow: 'hidden' as 'hidden',
    display: 'inline-block' as 'inline-block',
  },
  title: {
    lineHeight: '1em',
    whiteSpace: 'nowrap' as 'nowrap',
  },
  collapsedSubnodes: {
    color: theme.palette.text.secondary,
  },
})

export default withStyles(styles)(connect(null, mapDispatchToProps)(TreeNodeTitle))
