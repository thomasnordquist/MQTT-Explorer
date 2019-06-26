import * as q from '../../../backend/src/Model'
import { ActionTypes } from '../reducers/Sidebar'
import { AppState } from '../reducers'
import { Dispatch } from 'redux'
import { clearTopic } from './clearTopic'

export { clearTopic } from './clearTopic'

export const clearRetainedTopic = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const selectedTopic = getState().tree.get('selectedTopic')
  if (!selectedTopic) {
    return
  }

  dispatch(clearTopic(selectedTopic, false))
}

export const setCompareMessage = (message?: q.Message) => (dispatch: Dispatch<any>) => {
  dispatch({
    message,
    type: ActionTypes.SIDEBAR_SET_COMPARE_MESSAGE,
  })
}
