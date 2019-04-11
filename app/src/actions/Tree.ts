import * as q from '../../../backend/src/Model'
import { ActionTypes } from '../reducers/Tree'
import { AnyAction, Dispatch } from 'redux'
import { AppState } from '../reducers'
import { batchActions } from 'redux-batched-actions'
import { setTopic } from './Publish'
import { TopicViewModel } from '../model/TopicViewModel'
import { globalActions } from '.'
const debounce = require('lodash.debounce')

export const selectTopic = (topic: q.TreeNode<TopicViewModel>) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  debouncedSelectTopic(topic, dispatch, getState)
}

const debouncedSelectTopic = debounce((topic: q.TreeNode<TopicViewModel>, dispatch: Dispatch<any>, getState: () => AppState) => {
  const { selectedTopic } = getState().tree
  if (selectedTopic === topic) {
    return
  }

  // Update publish topic
  let setTopicDispatch: any | undefined
  if (selectedTopic && (selectedTopic.path() === getState().publish.topic || !getState().publish.topic)) {
    setTopicDispatch = setTopic(topic.path())
  }

  if (selectedTopic && selectedTopic.viewModel) {
    selectedTopic.viewModel.setSelected(false)
  }

  if (topic.viewModel) {
    topic.viewModel.setSelected(true)
  }

  const selectTreeTopicDispatch = {
    selectedTopic: topic,
    type: ActionTypes.TREE_SELECT_TOPIC,
  }

  if (setTopicDispatch) {
    dispatch(batchActions([selectTreeTopicDispatch, setTopicDispatch]))
  } else {
    dispatch(selectTreeTopicDispatch)
  }
}, 70)

export const showTree = (tree?: q.Tree<TopicViewModel>) => (dispatch: Dispatch<any>, getState: () => AppState): AnyAction => {
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

export const togglePause = (tree?: q.Tree<TopicViewModel>) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const paused = getState().tree.paused
  const tree = getState().tree.tree
  const changes = tree ? tree.unmergedChanges().length : 0

  if (paused && changes > 0) {
    dispatch(globalActions.showNotification('Applying recorded changes.'))
  }

  // Allow for notification to be displayed
  setTimeout(() => {
    tree && tree.applyUnmergedChanges()
    if (paused && changes > 0) {
      dispatch(globalActions.showNotification(`Sucessfully applied ${changes} changes.`))
    }
  }, 50)

  dispatch({
    type: paused ? ActionTypes.TREE_RESUME_UPDATES : ActionTypes.TREE_PAUSE_UPDATES,
  })

}
