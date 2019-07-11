import * as q from '../../../../../../backend/src/Model'
import React, { useEffect } from 'react'
import { TopicViewModel } from '../../../../model/TopicViewModel'

export function useViewModelSubscriptions(
  treeNode: q.TreeNode<TopicViewModel>,
  nodeRef: React.MutableRefObject<HTMLDivElement | undefined>,
  setSelected: (value: boolean) => void,
  setCollapsedOverride: (value: boolean) => void
) {
  useEffect(() => {
    const selectionDidChange = () => {
      const selected = treeNode.viewModel && treeNode.viewModel.isSelected()
      treeNode.viewModel && setSelected(Boolean(selected))

      if (selected && nodeRef && nodeRef.current) {
        nodeRef.current.focus({ preventScroll: false })
      }
    }

    const expandedDidChange = () => {
      treeNode.viewModel && setCollapsedOverride(!treeNode.viewModel.isExpanded())
    }

    function addSubscriber() {
      treeNode.viewModel = new TopicViewModel()
      treeNode.viewModel.selectionChange.subscribe(selectionDidChange)
      treeNode.viewModel.expandedChange.subscribe(expandedDidChange)
    }

    function removeSubscriber() {
      if (treeNode.viewModel) {
        treeNode.viewModel.selectionChange.unsubscribe(selectionDidChange)
        treeNode.viewModel.expandedChange.unsubscribe(expandedDidChange)
        treeNode.viewModel = undefined
      }
    }

    addSubscriber()
    return function cleanup() {
      removeSubscriber()
    }
  }, [treeNode])
}
