import React, { useCallback } from 'react'
import * as q from 'TEMP_BACKENDsrc/Model/Model'
import { KeyCodes } from '../../../../utils/KeyCodes'
import { treeActions } from '../../../../actions'

export function useDeleteKeyCallback(topic: q.TreeNode<any>, actions: typeof treeActions) {
  return useCallback(
    (event: React.KeyboardEvent) => {
      if (event.keyCode === KeyCodes.delete || event.keyCode === KeyCodes.backspace) {
        event.stopPropagation()
        event.preventDefault()
        actions.clearTopic(topic, true)
      }
    },
    [topic]
  )
}
