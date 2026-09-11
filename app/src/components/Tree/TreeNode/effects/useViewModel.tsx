import { useEffect } from 'react'
import * as q from 'TEMP_BACKENDsrc/Model/Model'
import { TopicViewModel } from '../../../../model/TopicViewModel'

export function useViewModel(treeNode: q.TreeNode<TopicViewModel> | undefined) {
  // Created during render rather than in the effect below, because the effect runs AFTER the first
  // render and callers read the returned view model during it. Returning undefined on that first
  // pass is not a transient cosmetic issue: `useDecoder` seeds `useState` from it, and a `useState`
  // initial value is only ever honoured once — so the automatically-detected decoder was captured
  // as undefined and never re-read, and every payload rendered raw unless a format was picked by
  // hand. Assigning here is idempotent and the node already treats `viewModel` as a cache.
  if (treeNode && !treeNode.viewModel) {
    treeNode.viewModel = new TopicViewModel(treeNode)
  }

  useEffect(() => {
    treeNode?.viewModel?.retain()

    return function cleanup() {
      treeNode?.viewModel?.release()
    }
  }, [treeNode])

  return treeNode?.viewModel
}
