import { ActionTypes, CustomAction } from '../reducers'

export const setPublishTopic = (topic: string): CustomAction  => {
  return {
    publishTopic: topic,
    type: ActionTypes.setPublishTopic,
  }
}

export const setPublishPayload = (payload: string): CustomAction => {
  return {
    publishPayload: payload,
    type: ActionTypes.setPublishPayload,
  }
}
