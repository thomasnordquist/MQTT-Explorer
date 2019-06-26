import * as q from '../../../backend/src/Model'
import { AppState } from '../reducers'
import { Dispatch } from 'redux'
import { makePublishEvent, rendererEvents } from '../../../events'
import { moveSelectionUpOrDownwards } from './visibleTreeTraversal'

export const clearTopic = (topic: q.TreeNode<any>, recursive: boolean, subtopicClearLimit = 50) => (
  dispatch: Dispatch<any>,
  getState: () => AppState
) => {
  dispatch(moveSelectionUpOrDownwards('next'))

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
  rendererEvents.emit(publishEvent, mqttMessage)
  if (recursive) {
    topic
      .childTopics()
      .filter(topic => Boolean(topic.message && topic.message.value))
      .slice(0, subtopicClearLimit)
      .forEach((topic, idx) => {
        const mqttMessage = {
          topic: topic.path(),
          payload: null,
          retain: true,
          qos: 0 as 0,
        }
        // Rate limit deletion
        setTimeout(() => rendererEvents.emit(publishEvent, mqttMessage), 20 * idx)
      })
  }
}
