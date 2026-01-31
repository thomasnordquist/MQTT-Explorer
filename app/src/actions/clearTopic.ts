import { Dispatch } from 'redux'
import * as q from '../../../backend/src/Model'
import { AppState } from '../reducers'
import { makePublishEvent, rendererEvents } from '../eventBus'
import { moveSelectionUpOrDownwards } from './visibleTreeTraversal'
import { globalActions } from '.'

export const clearTopic =
  (topic: q.TreeNode<any>, recursive: boolean) => async (dispatch: Dispatch<any>, getState: () => AppState) => {
    const topicsForPurging = recursive ? [topic, ...topic.childTopics()] : [topic]

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
          `Do you want to clear "${topic.path()}"${childTopicsMessage}?\n\nThis function will send an empty payload (QoS 0, retain) to this and every subtopic, clearing retained topics in the process. Only use this function if you know what you are doing.`
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

    topicsForPurging
      .filter(t => t.path() !== '' && t.hasMessage())
      .map(t => t.path())
      .forEach((path, idx) => {
        const mqttMessage = {
          topic: path,
          payload: null,
          retain: true,
          qos: 0 as const,
          messageId: undefined,
        }
        // Rate limit deletion
        setTimeout(() => rendererEvents.emit(publishEvent, mqttMessage), 20 * idx)
      })
  }
