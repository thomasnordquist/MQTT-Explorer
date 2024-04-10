import * as q from '../../../../../backend/src/Model'
import React, { memo } from 'react'
import { Base64Message } from '../../../../../backend/src/Model/Base64Message'
import { Theme, withStyles } from '@material-ui/core'
import { TopicViewModel } from '../../../model/TopicViewModel'

export interface TreeNodeProps extends React.HTMLAttributes<HTMLElement> {
  treeNode: q.TreeNode<TopicViewModel>
  lastUpdate: number
  name?: string | undefined
  collapsed?: boolean | undefined
  didSelectNode: any
  toggleCollapsed: any
  classes: any
}

class TreeNodeTitle extends React.PureComponent<TreeNodeProps, {}> {
  private renderSourceEdge() {
    const name = this.props.name || (this.props.treeNode.sourceEdge && this.props.treeNode.sourceEdge.name)

    return (
      <span key="edge" className={this.props.classes.sourceEdge} data-test-topic={name}>
        {name}
      </span>
    )
  }

  private truncatedMessage() {
    const limit = 400
    if (!this.props.treeNode.message || !this.props.treeNode.message.payload) {
      return ''
    }

    const str = Base64Message.toUnicodeString(this.props.treeNode.message.payload)
    return str.length > limit ? `${str.slice(0, limit)}…` : str
  }

  private renderValue() {
    return this.props.treeNode.message &&
      this.props.treeNode.message.payload &&
      this.props.treeNode.message.length > 0 ? (
      <span key="value" className={this.props.classes.value}>
        {' '}
        = {this.truncatedMessage()}
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
    const topicCount = this.props.treeNode.childTopicCount()
    return (
      <span key="metadata" className={this.props.classes.collapsedSubnodes}>{` (${topicCount} ${
        topicCount === 1 ? 'topic' : 'topics'
      }, ${messages} ${messages === 1 ? 'message' : 'messages'})`}</span>
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

export default withStyles(styles)(memo(TreeNodeTitle))
