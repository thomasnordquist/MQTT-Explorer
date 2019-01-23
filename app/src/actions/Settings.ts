import { Action, ActionTypes, TopicOrder } from '../reducers/Settings'
import { ActionTypes as TreeActionTypes } from '../reducers/Tree'
import { Dispatch } from 'redux'
import { showTree } from './Tree'
import { AppState } from '../reducers'
import * as q from '../../../backend/src/Model'
import { batchActions } from 'redux-batched-actions'
import { autoExpandLimitSet } from '../components/Settings'

export const setAutoExpandLimit = (autoExpandLimit: number = 0): Action => {
  return {
    autoExpandLimit,
    type: ActionTypes.SETTINGS_SET_AUTO_EXPAND_LIMIT,
  }
}

export const toggleSettingsVisibility = (): Action => {
  return {
    type: ActionTypes.SETTINGS_TOGGLE_VISIBILITY,
  }
}

export const setTopicOrder = (topicOrder: TopicOrder = TopicOrder.none): Action => {
  return {
    topicOrder,
    type: ActionTypes.SETTINGS_SET_TOPIC_ORDER,
  }
}

export const filterTopics = (filterStr: string) => (dispatch: Dispatch<any>, getState: () => AppState)  => {
  const { tree } = getState().connection

  dispatch({
    topicFilter: filterStr,
    type: ActionTypes.SETTINGS_FILTER_TOPICS,
  })

  if (!filterStr || !tree) {
    dispatch(batchActions([setAutoExpandLimit(0), (showTree(tree) as any)]))
    return
  }

  const topicFilter = filterStr.toLowerCase()

  const nodeFilter = (node: q.TreeNode): boolean => {
    const topicMatches = node.path().toLowerCase().indexOf(topicFilter) !== -1
    if (topicMatches) {
      return true
    }

    const messageMatches = (node.message && typeof node.message.value === 'string' && node.message.value.toLowerCase().indexOf(filterStr) !== -1)
    return Boolean(messageMatches)
  }

  const resultTree = tree.childTopics()
    .filter(nodeFilter)
    .map((node) => {
      const clone = node.unconnectedClone()
      q.TreeNodeFactory.insertNodeAtPosition(node.path().split('/'), clone)
      return clone.firstNode()
    })
    .reduce((a: q.TreeNode, b: q.TreeNode) => {
      a.updateWithNode(b)
      return a
    }, new q.Tree())

  const nextTree: q.Tree = resultTree as q.Tree
  if (tree.updateSource && tree.connectionId) {
    nextTree.updateWithConnection(tree.updateSource, tree.connectionId, nodeFilter)
  }

  dispatch(batchActions([setAutoExpandLimit(autoExpandLimitForTree(nextTree)), (showTree(nextTree) as any)]))
}

function autoExpandLimitForTree(tree: q.Tree) {
  if (!tree) {
    return 0
  }
  function closestExistingLimit(i: number): number {
    const sorted = autoExpandLimitSet.sort((a, b) => Math.abs(a.limit - i) - Math.abs(b.limit - i))
    return sorted[0]!.limit
  }

  const count = tree.childTopicCount()
  const calculatedLimit = Math.max(7 - Math.log(count), 0) * 2

  return closestExistingLimit(calculatedLimit)
}
