import * as q from '../../../../../../backend/src/Model'
import React, { useCallback } from 'react'
import { KeyCodes } from '../../../../utils/KeyCodes'
import { treeActions } from '../../../../actions'

export function useDeleteKeyCallback(topic: q.TreeNode<any>, actions: typeof treeActions) {
  return useCallback(
    (event: React.KeyboardEvent) => {
      if (event.keyCode === KeyCodes.delete || event.keyCode === KeyCodes.backspace) {
        event.stopPropagation()
        event.preventDefault()
        actions.clearTopic(topic, true, 50)
      }
    },
    [topic]
  )
}
