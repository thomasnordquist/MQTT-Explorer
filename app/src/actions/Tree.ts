import { AppState } from '../reducers'
import { ActionTypes } from '../reducers/Tree'
import * as q from '../../../backend/src/Model'
import { Dispatch } from 'redux'
import { setTopic } from './Publish'

export const selectTopic = (topic: q.TreeNode) => (dispatch: Dispatch<any>, getState: () => AppState)  => {
  const { selectedTopic } = getState().tree

  // Update publish topic
  if (selectedTopic && (selectedTopic.path() === getState().publish.topic || !getState().publish.topic)) {
    dispatch(setTopic(topic.path()))
  }

  dispatch({
    selectedTopic: topic,
    type: ActionTypes.TREE_SELECT_TOPIC,
  })
}

export const showTree = (tree?: q.Tree) => {
  return {
    tree,
    type: ActionTypes.TREE_SHOW_TREE,
  }
}
