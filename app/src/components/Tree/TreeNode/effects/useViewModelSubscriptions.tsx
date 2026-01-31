import React, { useCallback } from 'react'
import * as q from 'TEMP_BACKENDsrc/Model/Model'
import { TopicViewModel } from '../../../../model/TopicViewModel'
import { useSubscription } from '../../../hooks/useSubscription'
import { useViewModel } from './useViewModel'

export function useViewModelSubscriptions(
  treeNode: q.TreeNode<TopicViewModel>,
  nodeRef: React.MutableRefObject<HTMLDivElement | undefined>,
  setSelected: (value: boolean) => void,
  setCollapsedOverride: (value: boolean) => void
) {
  const viewModel = useViewModel(treeNode)

  const selectionDidChange = useCallback(() => {
    const selected = viewModel && viewModel.isSelected()
    viewModel && setSelected(Boolean(selected))

    if (selected && nodeRef && nodeRef.current) {
      nodeRef.current.focus({ preventScroll: false })
    }
  }, [viewModel])

  const expandedDidChange = useCallback(() => {
    viewModel && setCollapsedOverride(!viewModel.isExpanded())
  }, [viewModel])

  useSubscription(viewModel?.selectionChange, selectionDidChange)
  useSubscription(viewModel?.expandedChange, expandedDidChange)
}
