import * as q from '../../../backend/src/Model'
import { AppState } from '../reducers'
import { Dispatch } from 'redux'
import { makePublishEvent, rendererEvents } from '../../../events'
import { moveSelectionUpOrDownwards } from './visibleTreeTraversal'
import { globalActions } from '.'

export const clearTopic = (topic: q.TreeNode<any>, recursive: boolean) => async (
  dispatch: Dispatch<any>,
  getState: () => AppState
) => {
  if (recursive) {
    const topicCount = topic.childTopicCount()

    const topicDelta = topic.hasMessage() ? -1 : 0
    const childTopicsMessage =
      topicCount + topicDelta > 0
        ? ` and ${topicCount + topicDelta} child ${topicCount + topicDelta === 1 ? 'topic' : 'topics'}`
        : ''

    const confirmed = await dispatch(
      globalActions.requestConfirmation(
        'Confirm delete',
        `Do you want to delete "${topic.path()}"${childTopicsMessage}?`
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
  const topicsForPurging = recursive ? [topic, ...topic.childTopics()] : [topic]

  topicsForPurging
    .filter(t => t.path() !== '' && t.hasMessage())
    .map(t => t.path())
    .forEach((path, idx) => {
      const mqttMessage = {
        topic: path,
        payload: null,
        retain: true,
        qos: 0 as 0,
      }
      // Rate limit deletion
      setTimeout(() => rendererEvents.emit(publishEvent, mqttMessage), 20 * idx)
    })
}
