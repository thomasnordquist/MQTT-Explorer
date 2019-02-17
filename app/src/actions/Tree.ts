import { AppState } from '../reducers'
import { ActionTypes } from '../reducers/Tree'
import * as q from '../../../backend/src/Model'
import { Dispatch, AnyAction } from 'redux'
import { setTopic } from './Publish'
import { TopicViewModel } from '../TopicViewModel'
import { batchActions } from 'redux-batched-actions'
import { treeActions } from '.';
const debounce = require('lodash.debounce')

export const selectTopic = (topic: q.TreeNode<TopicViewModel>) => (dispatch: Dispatch<any>, getState: () => AppState)  => {
  debouncedSelectTopic(topic, dispatch, getState)
}

const debouncedSelectTopic = debounce((topic: q.TreeNode<TopicViewModel>, dispatch: Dispatch<any>, getState: () => AppState)  => {
  const { selectedTopic } = getState().tree
  if (selectedTopic === topic) {
    return
  }

  // Update publish topic
  let setTopicDispatch: any | undefined
  if (selectedTopic && (selectedTopic.path() === getState().publish.topic || !getState().publish.topic)) {
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

export const handleKeyEvent = (key: string) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const state = getState()
  const { tree, selectedTopic } = state.tree
  if (!tree) {
    return
  }

  if (!selectedTopic) {
    return dispatch(selectTopic(tree.firstNode()))
  }

  const visibleTopics: q.TreeNode<TopicViewModel>[] = tree.childTopics().filter(topic => topic.viewModel && topic.viewModel.attached)
  if (key === 'down') {
    debugger
    const selectedIndex = visibleTopics.indexOf(selectedTopic)
    const nextIndex = (visibleTopics.length - 1) % (selectedIndex + 1)
    return dispatch(selectTopic(visibleTopics[nextIndex]))
  }
}

export const showTree = (tree?: q.Tree<TopicViewModel>) => (dispatch: Dispatch<any>, getState: () => AppState): AnyAction  => {
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
