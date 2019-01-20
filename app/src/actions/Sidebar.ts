import { Dispatch, Action } from 'redux'
import { AppState } from '../reducers'
import { makePublishEvent, rendererEvents } from '../../../events'

export const clearRetainedTopic = () => (dispatch: Dispatch<Action>, getState: () => AppState)  => {
  const { selectedTopic } = getState().tooBigReducer
  const { connectionId } = getState().connection

  if (!selectedTopic || !connectionId) {
    return
  }

  const publishEvent = makePublishEvent(connectionId)
  const mqttMessage = {
    topic: selectedTopic.path(),
    payload: null,
    retain: true,
    qos: 0 as 0,
  }
  rendererEvents.emit(publishEvent, mqttMessage)
}
