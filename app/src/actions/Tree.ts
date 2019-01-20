import { ActionTypes, CustomAction, AppState } from '../reducers'
import * as q from '../../../backend/src/Model'
import { Dispatch } from 'redux'
import { setTopic } from './Publish'

export const selectTopic = (topic: q.TreeNode) => (dispatch: Dispatch<any>, getState: () => AppState)  => {
  const { selectedTopic } = getState().tooBigReducer

  // Update publish topic
  if (selectedTopic && (selectedTopic.path() === getState().publish.topic || !getState().publish.topic)) {
    dispatch(setTopic(topic.path()))
  }

  dispatch({
    selectedTopic: topic,
    type: ActionTypes.selectTopic,
  })
}
