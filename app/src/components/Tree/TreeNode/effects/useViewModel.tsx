import { useEffect } from 'react'
import * as q from 'TEMP_BACKENDsrc/Model/Model'
import { TopicViewModel } from '../../../../model/TopicViewModel'

export function useViewModel(treeNode: q.TreeNode<TopicViewModel> | undefined) {
  useEffect(() => {
    if (treeNode && !treeNode?.viewModel) {
      treeNode.viewModel = new TopicViewModel(treeNode)
    }
    treeNode?.viewModel?.retain()

    return function cleanup() {
      treeNode?.viewModel?.release()
    }
  }, [treeNode])

  return treeNode?.viewModel
}
