import { ActionTypes, Action } from '../reducers/Publish'
import { AppState } from '../reducers'
import { Dispatch } from 'redux'
import { rendererEvents, makePublishEvent } from '../../../events'

export const setTopic = (topic?: string): Action  => {
  return {
    topic,
    type: ActionTypes.PUBLISH_SET_TOPIC,
  }
}

export const setPayload = (payload?: string): Action => {
  return {
    payload,
    type: ActionTypes.PUBLISH_SET_PAYLOAD,
  }
}

export const toggleEmptyPayload = (): Action => {
  return {
    type: ActionTypes.PUBLISH_TOGGLE_EMPTY_PAYLOAD,
  }
}

export const setQoS = (qos: 0 | 1 | 2): Action => {
  return {
    qos,
    type: ActionTypes.PUBLISH_SET_QOS,
  }
}

export const setEditorMode = (editorMode: string): Action => {
  return {
    editorMode,
    type: ActionTypes.PUBLISH_SET_EDITOR_MODE,
  }
}

export const publish = (connectionId: string) => (dispatch: Dispatch<Action>, getState: () => AppState)  => {
  const state = getState()
  const topic = state.publish.topic

  if (!topic) {
    return
  }

  const publishEvent = makePublishEvent(connectionId)
  rendererEvents.emit(publishEvent, {
    topic,
    payload: state.publish.payload,
    retain: state.publish.retain,
    qos: state.publish.qos,
  })
}

export const toggleRetain = (): Action => {
  return {
    type: ActionTypes.PUBLISH_TOGGLE_RETAIN,
  }
}
