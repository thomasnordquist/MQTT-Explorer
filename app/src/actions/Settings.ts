import { Action, ActionTypes, TopicOrder } from '../reducers/Settings'

export const setAutoExpandLimit = (autoExpandLimit: number = 0): Action => {
  return {
    autoExpandLimit,
    type: ActionTypes.SETTINGS_SET_AUTO_EXPAND_LIMIT,
  }
}

export const toggleSettingsVisibility = (): Action => {
  return {
    type: ActionTypes.SETTINGS_TOGGLE_VISIBILITY,
  }
}

export const setTopicOrder = (topicOrder: TopicOrder = TopicOrder.none): Action => {
  return {
    topicOrder,
    type: ActionTypes.SETTINGS_SET_TOPIC_ORDER,
  }
}

export const filterTopics = (topicFilter: string): Action => {
  return {
    topicFilter,
    type: ActionTypes.SETTINGS_FILTER_TOPICS,
  }
}
