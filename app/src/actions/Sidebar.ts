import { Dispatch, Action } from 'redux'
import { AppState } from '../reducers'
import { makePublishEvent, rendererEvents } from '../../../events'
import * as q from '../../../backend/src/Model'

export const clearRetainedTopic = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const { selectedTopic } = getState().tree
  if (!selectedTopic) {
    return
  }

  dispatch(clearTopic(selectedTopic, false))
}

export const clearTopic = (topic: q.TreeNode<any>, recursive: boolean) => (dispatch: Dispatch<any>, getState: () => AppState)  => {
  const { connectionId } = getState().connection
  if (!connectionId) {
    return
  }

  const publishEvent = makePublishEvent(connectionId)
  const mqttMessage = {
    topic: topic.path(),
    payload: null,
    retain: true,
    qos: 0 as 0,
  }
  console.log('deleting', topic.path())
  rendererEvents.emit(publishEvent, mqttMessage)

  if (recursive) {
    topic.childTopics().forEach((topic) => {
      console.log('deleting', topic.path())
      const mqttMessage = {
        topic: topic.path(),
        payload: null,
        retain: true,
        qos: 0 as 0,
      }
      rendererEvents.emit(publishEvent, mqttMessage)
    })
  }
}
