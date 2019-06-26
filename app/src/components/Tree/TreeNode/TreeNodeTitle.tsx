import * as React from 'react'
import * as q from '../../../../../backend/src/Model'
import { withStyles, Theme } from '@material-ui/core'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'

export interface TreeNodeProps extends React.HTMLAttributes<HTMLElement> {
  treeNode: q.TreeNode<TopicViewModel>
  name?: string | undefined
  collapsed?: boolean | undefined
  didSelectNode: any
  toggleCollapsed: any
  classes: any
}

class TreeNodeTitle extends React.Component<TreeNodeProps, {}> {
  private renderSourceEdge() {
    const name = this.props.name || (this.props.treeNode.sourceEdge && this.props.treeNode.sourceEdge.name)

    return (
      <span key="edge" className={this.props.classes.sourceEdge}>
        {name}
      </span>
    )
  }

  private renderValue() {
    return this.props.treeNode.message &&
      this.props.treeNode.message.value &&
      this.props.treeNode.message.length > 0 ? (
      <span key="value" className={this.props.classes.value}>
        {' '}
        = {Base64Message.toUnicodeString(this.props.treeNode.message.value).slice(0, 120)}
      </span>
    ) : null
  }

  private renderExpander() {
    if (this.props.treeNode.edgeCount() === 0) {
      return null
    }

    return (
      <span key="expander" className={this.props.classes.expander} onClick={this.props.toggleCollapsed}>
        {this.props.collapsed ? '▶' : '▼'}
      </span>
    )
  }

  private renderMetadata() {
    if (this.props.treeNode.edgeCount() === 0 || !this.props.collapsed) {
      return null
    }

    const messages = this.props.treeNode.leafMessageCount()
    return (
      <span
        key="metadata"
        className={this.props.classes.collapsedSubnodes}
      >{`(${this.props.treeNode.childTopicCount()} topics, ${messages} messages)`}</span>
    )
  }

  public render() {
    return [this.renderExpander(), this.renderSourceEdge(), this.renderMetadata(), this.renderValue()]
  }
}

const styles = (theme: Theme) => ({
  value: {
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    textOverflow: 'ellipsis' as 'ellipsis',
    padding: '0',
  },
  sourceEdge: {
    fontWeight: 'bold' as 'bold',
    overflow: 'hidden' as 'hidden',
  },
  expander: {
    color: theme.palette.type === 'light' ? '#222' : '#eee',
    cursor: 'pointer' as 'pointer',
    paddingRight: theme.spacing(0.25),
    userSelect: 'none' as 'none',
  },
  collapsedSubnodes: {
    color: theme.palette.text.secondary,
    userSelect: 'none' as 'none',
  },
})

export default withStyles(styles)(TreeNodeTitle)
