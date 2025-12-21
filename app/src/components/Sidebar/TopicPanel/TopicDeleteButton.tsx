import * as q from '../../../../../backend/src/Model'
import CustomIconButton from '../../helper/CustomIconButton'
import Delete from '@mui/icons-material/Delete'
import React from 'react'

export const TopicDeleteButton = (props: {
  node?: q.TreeNode<any>
  deleteTopicAction: (node: q.TreeNode<any>) => void
}) => {
  const { node } = props
  if (!node || !node.message || !node.message.payload) {
    return null
  }
  return (
    <CustomIconButton onClick={() => props.deleteTopicAction(node)} tooltip="Clear this topic">
      <Delete />
    </CustomIconButton>
  )
}
