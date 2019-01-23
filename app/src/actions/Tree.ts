import { AppState } from '../reducers'
import { ActionTypes } from '../reducers/Tree'
import * as q from '../../../backend/src/Model'
import { Dispatch, AnyAction } from 'redux'
import { setTopic } from './Publish'

export const selectTopic = (topic: q.TreeNode) => (dispatch: Dispatch<any>, getState: () => AppState): AnyAction  => {
  const { selectedTopic } = getState().tree

  // Update publish topic
  if (selectedTopic && (selectedTopic.path() === getState().publish.topic || !getState().publish.topic)) {
    dispatch(setTopic(topic.path()))
  }

  return dispatch({
    selectedTopic: topic,
    type: ActionTypes.TREE_SELECT_TOPIC,
  })
}

export const showTree = (tree?: q.Tree) => (dispatch: Dispatch<any>, getState: () => AppState): AnyAction  => {
  const visibleTree = getState().tree.tree
  const connectionTree = getState().connection.tree

  // Stop updates of old tree
  if (visibleTree !== connectionTree && visibleTree) {
    visibleTree.stopUpdating()
  }

  return dispatch({
    tree,
    type: ActionTypes.TREE_SHOW_TREE,
  })
}
