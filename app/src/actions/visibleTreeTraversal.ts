import { Dispatch } from 'redux'
import * as q from '../../../backend/src/Model'
import { AppState } from '../reducers'
import { selectTopic } from './Tree'
import { SettingsState } from '../reducers/Settings'
import { sortedNodes } from '../sortedNodes'
import { TopicViewModel } from '../model/TopicViewModel'

export const moveSelectionUpOrDownwards =
  (direction: 'next' | 'previous') =>
  (dispatch: Dispatch<any>, getState: () => AppState): any => {
    const state = getState()
    const selected = state.tree.get('selectedTopic')
    const tree = state.tree.get('tree')

    if (!selected || !tree) {
      if (tree) {
        dispatch(selectTopic(tree))
      }
      return
    }
    const nextTreeNode = nextVisibleElementInTree(state.settings, tree, selected, direction)
    if (nextTreeNode && nextTreeNode.viewModel) {
      dispatch(selectTopic(nextTreeNode))
    }
  }

export const moveInward =
  () =>
  (dispatch: Dispatch<any>, getState: () => AppState): any => {
    const state = getState()
    const selected = state.tree.get('selectedTopic')
    if (!selected || !selected.viewModel) {
      return
    }

    if (!selected.viewModel.isExpanded() && selected.edgeCount() > 0) {
      selected.viewModel.setExpanded(true, true)
    } else {
      dispatch(moveSelectionUpOrDownwards('next'))
    }
  }

export const moveOutward =
  () =>
  (dispatch: Dispatch<any>, getState: () => AppState): any => {
    const state = getState()
    const selected = state.tree.get('selectedTopic')
    if (!selected || !selected.viewModel) {
      return
    }

    if (selected.viewModel.isExpanded() && selected.edgeCount() > 0) {
      selected.viewModel.setExpanded(false, true)
    } else {
      dispatch(moveSelectionUpOrDownwards('previous'))
    }
  }

function isTreeNodeVisible(treeNode: q.TreeNode<any>) {
  return Boolean(treeNode.viewModel)
}

function nextVisibleElementInTree(
  settings: SettingsState,
  tree: q.Tree<TopicViewModel>,
  node: q.TreeNode<TopicViewModel>,
  direction: 'next' | 'previous'
): q.TreeNode<TopicViewModel> | undefined {
  if (direction === 'next') {
    return findNextNodeDownward(settings, node)
  }
  return findNextNodeUpward(settings, node)
}

/** Not very efficient but easy to implement, complexity should not be an issue here  */
function findNextNodeUpward(
  settings: SettingsState,
  treeNode: q.TreeNode<TopicViewModel>
): q.TreeNode<TopicViewModel> | undefined {
  const parent = treeNode.sourceEdge && treeNode.sourceEdge.source
  if (!parent) {
    return undefined
  }

  const neighborNodes = sortedNodes(settings, parent)
  const nodeIdx = neighborNodes.findIndex(n => n.path() === treeNode.path())
  if (nodeIdx === 0) {
    return parent
  }
  const upwardNeighbor = neighborNodes[nodeIdx - 1]
  if (upwardNeighbor) {
    return lastVisibleChild(settings, upwardNeighbor)
  }
  return findNextNodeUpward(settings, parent)
}

function lastVisibleChild(settings: SettingsState, treeNode: q.TreeNode<TopicViewModel>): q.TreeNode<TopicViewModel> {
  const nodes = sortedNodes(settings, treeNode).filter(isTreeNodeVisible)
  if (nodes.length === 0) {
    return treeNode
  }
  return lastVisibleChild(settings, nodes[nodes.length - 1])
}

function findNextNodeDownward(
  settings: SettingsState,
  treeNode: q.TreeNode<TopicViewModel>
): q.TreeNode<TopicViewModel> | undefined {
  const children = sortedNodes(settings, treeNode).filter(isTreeNodeVisible)
  const firstChild = children[0]
  if (firstChild) {
    return firstChild
  }

  return findNextNodeDownwardNeighbor(settings, treeNode)
}

function findNextNodeDownwardNeighbor(
  settings: SettingsState,
  treeNode: q.TreeNode<TopicViewModel>
): q.TreeNode<TopicViewModel> | undefined {
  const parent = treeNode.sourceEdge && treeNode.sourceEdge.source
  if (!parent) {
    return undefined
  }

  const neighborNodes = sortedNodes(settings, parent).filter(isTreeNodeVisible)
  const nodeIdx = neighborNodes.findIndex(n => n.path() === treeNode.path())
  const downwardNeighbor = neighborNodes[nodeIdx + 1]
  if (downwardNeighbor) {
    return downwardNeighbor
  }
  return findNextNodeDownwardNeighbor(settings, parent)
}
