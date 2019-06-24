import * as q from '../../../backend/src/Model'
import { AppState } from '../reducers'
import { Dispatch } from 'redux'
import { selectTopic } from './Tree'
import { SettingsState } from '../reducers/Settings'
import { sortedNodes } from '../sortedNodes'
import { TopicViewModel } from '../model/TopicViewModel'

export const moveSelectionUpOrDownwards = (direction: 'next' | 'previous') => (
  dispatch: Dispatch<any>,
  getState: () => AppState
): any => {
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

export const moveInward = () => (dispatch: Dispatch<any>, getState: () => AppState): any => {
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

export const moveOutward = () => (dispatch: Dispatch<any>, getState: () => AppState): any => {
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
  const nodes = flattenVisibleTree(settings, tree)
  const idx = nodes.findIndex(n => n.path() === node.path())
  const indexDirection = direction === 'next' ? 1 : -1
  return nodes[idx + indexDirection]
}

/** Not very efficient but easy to implement, complexity should not be an issue here  */
function flattenVisibleTree(
  settings: SettingsState,
  treeNode: q.TreeNode<TopicViewModel>
): Array<q.TreeNode<TopicViewModel>> {
  return sortedNodes(settings, treeNode)
    .filter(isTreeNodeVisible)
    .map(node => [node].concat(flattenVisibleTree(settings, node)))
    .reduce((a, b) => a.concat(b), [])
}
