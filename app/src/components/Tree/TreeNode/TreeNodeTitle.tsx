import React, { memo } from 'react'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import * as q from 'mqtt-explorer-backend/src/Model/Model'
import { TopicViewModel } from '../../../model/TopicViewModel'
import { useDecoder } from '../../hooks/useDecoder'

export interface TreeNodeProps extends React.HTMLAttributes<HTMLElement> {
  treeNode: q.TreeNode<TopicViewModel>
  lastUpdate: number
  name?: string | undefined
  collapsed?: boolean | undefined
  didSelectNode: any
  toggleCollapsed: any
  classes: any
}

export function TreeNodeTitle(props: TreeNodeProps) {
  const decodeMessage = useDecoder(props.treeNode)

  function renderSourceEdge() {
    const name = props.name || (props.treeNode.sourceEdge && props.treeNode.sourceEdge.name)

    return (
      <span key="edge" className={props.classes.sourceEdge} data-test-topic={name}>
        {name}
      </span>
    )
  }

  function truncatedMessage() {
    const limit = 400
    if (!props.treeNode.message || !props.treeNode.message.payload) {
      return ''
    }
    const [value = ''] = decodeMessage(props.treeNode.message)?.message?.format(props.treeNode.type) ?? []

    return value.length > limit ? `${value.slice(0, limit)}…` : value
  }

  function renderValue() {
    return props.treeNode.message && props.treeNode.message.payload && props.treeNode.message.length > 0 ? (
      <span key="value" className={props.classes.value}>
        {' '}
        =
        {' '}
        {truncatedMessage()}
      </span>
    ) : null
  }

  function renderExpander() {
    if (props.treeNode.edgeCount() === 0) {
      return null
    }

    return (
      <span key="expander" className={props.classes.expander} onClick={props.toggleCollapsed}>
        {props.collapsed ? '▶' : '▼'}
      </span>
    )
  }

  function renderMetadata() {
    if (props.treeNode.edgeCount() === 0 || !props.collapsed) {
      return null
    }

    const messages = props.treeNode.leafMessageCount()
    const topicCount = props.treeNode.childTopicCount()
    return (
      <span key="metadata" className={props.classes.collapsedSubnodes}>
        {` (${topicCount} ${
          topicCount === 1 ? 'topic' : 'topics'
        }, ${messages} ${messages === 1 ? 'message' : 'messages'})`}
      </span>
    )
  }

  return (
    <>
      {renderExpander()}
      {renderSourceEdge()}
      {renderMetadata()}
      {renderValue()}
    </>
  )
}

const styles = (theme: Theme) => ({
  value: {
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    padding: '0',
  },
  sourceEdge: {
    fontWeight: 'bold' as const,
    overflow: 'hidden' as const,
  },
  expander: {
    color: theme.palette.mode === 'light' ? '#222' : '#eee',
    cursor: 'pointer' as const,
    paddingRight: theme.spacing(0.25),
    userSelect: 'none' as const,
  },
  collapsedSubnodes: {
    color: theme.palette.text.secondary,
    userSelect: 'none' as const,
  },
})

export default withStyles(styles)(memo(TreeNodeTitle))
