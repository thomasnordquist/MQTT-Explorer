import * as q from '../../../../../backend/src/Model'
import CustomIconButton from '../../helper/CustomIconButton'
import Delete from '@material-ui/icons/Delete'
import React, { useCallback } from 'react'
import { Badge } from '@material-ui/core'

export const RecursiveTopicDeleteButton = (props: {
  node?: q.TreeNode<any>
  deleteTopicAction: (node: q.TreeNode<any>, a: boolean, limit: number) => void
}) => {
  const onClick = useCallback(() => {
    if (props.node) {
      props.deleteTopicAction(props.node, true, deleteLimit)
    }
  }, [props.node])
  if (!props.node) {
    return null
  }
  const deleteLimit = 50
  const topicCount = props.node ? props.node.childTopicCount() : 0
  if (topicCount === 0 || (props.node.message && topicCount === 1)) {
    return null
  }
  return (
    <Badge
      style={{
        top: '3px',
        right: '3px',
      }}
      badgeContent={<span style={{ whiteSpace: 'nowrap' }}>{topicCount >= deleteLimit ? '50+' : topicCount}</span>}
      color="secondary"
    >
      <CustomIconButton onClick={onClick} tooltip={`Deletes up to ${deleteLimit} sub-topics with a single click`}>
        <Delete style={{ marginTop: '-3px' }} color="action" />
      </CustomIconButton>
    </Badge>
  )
}
