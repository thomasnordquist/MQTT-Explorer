import { AnyAction, Dispatch } from 'redux'
import { batchActions } from 'redux-batched-actions'
import debounce from 'lodash.debounce'
import * as q from '../../../backend/src/Model'
import { ActionTypes } from '../reducers/Tree'
import { ActionTypes as SidebarActionTypes } from '../reducers/Sidebar'
import { AppState } from '../reducers'
import { globalActions } from '.'
import { setTopic } from './Publish'
import { TopicViewModel } from '../model/TopicViewModel'

export { clearTopic } from './clearTopic'

export { moveSelectionUpOrDownwards, moveInward, moveOutward } from './visibleTreeTraversal'

export const selectTopic =
  (topic: q.TreeNode<TopicViewModel>) => (dispatch: Dispatch<any>, getState: () => AppState) => {
    debouncedSelectTopic(topic, dispatch, getState)
  }

const debouncedSelectTopic = debounce(
  (topic: q.TreeNode<TopicViewModel>, dispatch: Dispatch<any>, getState: () => AppState) => {
    const previouslySelectedTopic = getState().tree.get('selectedTopic')

    if (previouslySelectedTopic === topic) {
      return
    }

    // Update publish topic
    let setTopicDispatch: any | undefined
    if (!getState().publish.manualTopic) {
      setTopicDispatch = setTopic(topic.path())
    } else if (previouslySelectedTopic && previouslySelectedTopic.path() === getState().publish.manualTopic) {
      setTopicDispatch = setTopic(topic.path())
    }

    previouslySelectedTopic?.viewModel?.setSelected(false)
    topic.viewModel?.setSelected(true)

    const selectTreeTopicDispatch = {
      selectedTopic: topic,
      type: ActionTypes.TREE_SELECT_TOPIC,
    }

    dispatch({
      type: SidebarActionTypes.SIDEBAR_SET_COMPARE_MESSAGE,
      message: undefined,
    })

    if (setTopicDispatch) {
      dispatch(batchActions([selectTreeTopicDispatch, setTopicDispatch]))
    } else {
      dispatch(selectTreeTopicDispatch)
    }
  },
  70
)

function destroyUnreferencedTree(state: AppState) {
  const visibleTree = state.tree.get('tree')
  const connectionTree = state.connection.tree

  // Stop updates of old tree
  if (visibleTree && visibleTree !== connectionTree) {
    console.warn('destroy')
    visibleTree.stopUpdating()
    visibleTree.destroy()
  }
}

export const resetStore =
  () =>
  (dispatch: Dispatch<any>, getState: () => AppState): AnyAction => {
    destroyUnreferencedTree(getState())

    return dispatch({
      type: ActionTypes.TREE_RESET_STORE,
    })
  }

export const showTree =
  (tree: q.Tree<TopicViewModel> | undefined) =>
  (dispatch: Dispatch<any>, getState: () => AppState): AnyAction => {
    destroyUnreferencedTree(getState())

    return dispatch({
      tree,
      type: ActionTypes.TREE_SHOW_TREE,
    })
  }

export const togglePause = (tree?: q.Tree<TopicViewModel>) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const paused = getState().tree.get('paused')
  const tree = getState().tree.get('tree')
  const changes = tree ? tree.unmergedChanges().length : 0

  if (tree) {
    paused ? tree.resume() : tree.pause()
  }

  if (paused && changes > 0) {
    dispatch(globalActions.showNotification('Applying recorded changes.'))
  }

  // Allow for notification to be displayed
  setTimeout(() => {
    if (paused && changes > 0) {
      dispatch(globalActions.showNotification(`Successfully applied ${changes} changes.`))
    }
  }, 50)

  dispatch({
    type: paused ? ActionTypes.TREE_RESUME_UPDATES : ActionTypes.TREE_PAUSE_UPDATES,
  })
}
