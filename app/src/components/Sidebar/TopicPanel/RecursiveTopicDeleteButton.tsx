import Delete from '@mui/icons-material/Delete'
import React, { useCallback } from 'react'
import { Badge } from '@mui/material'
import * as q from '../../../../../backend/src/Model'
import CustomIconButton from '../../helper/CustomIconButton'

export function RecursiveTopicDeleteButton(props: {
  node?: q.TreeNode<any>
  deleteTopicAction: (node: q.TreeNode<any>, a: boolean, limit: number) => void
}) {
  const onClick = useCallback(
    (event: React.MouseEvent) => {
      if (props.node) {
        event.stopPropagation()
        event.preventDefault()
        props.deleteTopicAction(props.node, true, Infinity)
      }
    },
    [props.node]
  )

  if (!props.node) {
    return null
  }

  const topicCount = props.node ? props.node.childTopicCount() : 0
  if (topicCount === 0 || (props.node.message && topicCount === 1)) {
    return null
  }
  return (
    <Badge badgeContent={<span style={{ whiteSpace: 'nowrap' }}>{topicCount}</span>} color="secondary">
      <CustomIconButton onClick={onClick} tooltip={`Deletes ${topicCount} sub-topics with a single click`}>
        <Delete color="action" />
      </CustomIconButton>
    </Badge>
  )
}
