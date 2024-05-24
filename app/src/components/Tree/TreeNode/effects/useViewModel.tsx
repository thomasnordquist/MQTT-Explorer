import * as q from '../../../../../../backend/src/Model'
import { useEffect } from 'react'
import { TopicViewModel } from '../../../../model/TopicViewModel'

export function useViewModel(treeNode: q.TreeNode<TopicViewModel> | undefined) {
  useEffect(() => {
    // if (treeNode && !treeNode?.viewModel) {
    //   treeNode.viewModel = new TopicViewModel(treeNode)
    // }
    treeNode?.viewModel?.retain()

    return function cleanup() {
      treeNode?.viewModel?.release()
    }
  }, [treeNode])

  return treeNode?.viewModel
}
