import * as q from '../../../backend/src/Model'
import { AppState } from '../reducers'
import { Dispatch } from 'redux'
import { makePublishEvent, rendererEvents } from '../../../events'
import { moveSelectionUpOrDownwards } from './visibleTreeTraversal'
import { globalActions } from '.'

export const clearTopic = (topic: q.TreeNode<any>, recursive: boolean, subtopicClearLimit = 50) => async (
  dispatch: Dispatch<any>,
  getState: () => AppState
) => {
  if (recursive) {
    const topicCount = topic.childTopicCount()
    const deleteLimitMessage =
      topicCount > subtopicClearLimit ? ` You can only delete ${subtopicClearLimit} child topics at once.` : ''
    const childTopicsMessage = topicCount > 0 ? ` and ${topicCount} child ${topicCount === 1 ? 'topic' : 'topics'}` : ''
    const confirmed = await dispatch(
      globalActions.requestConfirmation(
        'Confirm delete',
        `Do you want to delete "${topic.path()}"${childTopicsMessage}?${deleteLimitMessage}`
      )
    )
    if (!confirmed) {
      return
    }
  }

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
