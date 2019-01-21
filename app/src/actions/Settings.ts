import { Action, ActionTypes, TopicOrder } from '../reducers/Settings'
import { ActionTypes as TreeActionTypes, Action as TreeAction } from '../reducers/Tree'
import { Dispatch } from 'redux'
import { AppState } from '../reducers'
import * as q from '../../../backend/src/Model'

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
  const topicFilter = filterStr.toLowerCase()

  dispatch({
    topicFilter,
    type: ActionTypes.SETTINGS_FILTER_TOPICS,
  })

  const { tree } = getState().connection
  if (!tree) {
    return
  }

  if (!topicFilter) {
    dispatch({
      tree,
      filter: '',
      type: TreeActionTypes.TREE_SHOW_TREE,
    })

    return
  }

  const resultTree = tree.leafes()
    .filter(leaf => leaf.path().toLowerCase().indexOf(topicFilter) !== -1)
    .map((node) => {
      const clone = node.unconnectedClone()
      q.TreeNodeFactory.insertNodeAtPosition(node.path().split('/'), clone)
      return clone.firstNode()
    })
    .reduce((a: q.TreeNode, b: q.TreeNode) => {
      a.updateWithNode(b)
      return a
    }, new q.Tree())

  dispatch({
    tree: resultTree,
    filter: topicFilter,
    type: TreeActionTypes.TREE_SHOW_TREE,
  })
}
