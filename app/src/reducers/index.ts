import * as q from '../../../backend/src/Model'

import { Action, Reducer } from 'redux'

import { trackEvent } from '../tracking'

export enum ActionTypes {
  setAutoExpandLimit = 'SET_AUTO_EXPAND_LIMIT',
  toggleSettingsVisibility = 'TOGGLE_SETTINGS_VISIBILITY',
  setNodeOrder = 'SET_NODE_ORDER',
  selectTopic = 'SELECT_TOPIC',
  setPublishTopic = 'SET_PUBLISH_TOPIC',
  setPublishPayload = 'SET_PUBLISH_PAYLOAD',
  showUpdateNotification = 'SHOW_UPDATE_NOTIFICATION',
  showUpdateDetails = 'SHOW_UPDATE_DETAILS',
}

export interface CustomAction extends Action {
  type: ActionTypes,
  autoExpandLimit?: number
  nodeOrder?: NodeOrder
  selectedTopic?: q.TreeNode
  publishTopic?: string
  publishPayload?: string
  showUpdateNotification?: boolean
  showUpdateDetails?: boolean
}

export interface SidebarState {
  publishTopic?: string
  publishPayload?: string
}

export interface AppState {
  settings: SettingsState,
  selectedTopic?: q.TreeNode
  sidebar: SidebarState
  showUpdateNotification?: boolean
  showUpdateDetails: boolean
}

export interface SettingsState {
  autoExpandLimit: number
  visible: boolean
  nodeOrder: NodeOrder
}

export enum NodeOrder {
  none = 'none',
  messages = '#messages',
  abc = 'abc',
  topics = '#topics',
}

const reducer: Reducer<AppState | undefined, CustomAction> = (state, action) => {
  if (!state) {
    throw Error('No initial state')
  }
  trackEvent(action.type)
  console.log(action, state)
  switch (action.type) {
    case ActionTypes.setAutoExpandLimit:
      if (action.autoExpandLimit === undefined) {
        return state
      }
      return {
        ...state,
        settings: {
          ...state.settings,
          autoExpandLimit: action.autoExpandLimit,
        },
      }
    case ActionTypes.setPublishTopic:
      return {
        ...state,
        sidebar: { ...state.sidebar, publishTopic: action.publishTopic },
      }
    case ActionTypes.setPublishPayload:
      return {
        ...state,
        sidebar: { ...state.sidebar, publishPayload: action.publishPayload },
      }
    case ActionTypes.toggleSettingsVisibility:
      return {
        ...state,
        settings: {
          ...state.settings,
          visible: !state.settings.visible,
        },
      }
    case ActionTypes.selectTopic:
      if (!action.selectedTopic) {
        return state
      }
      return {
        ...state,
        selectedTopic: action.selectedTopic,
      }
    case ActionTypes.setNodeOrder:
      if (!action.nodeOrder) {
        return state
      }
      return {
        ...state,
        settings: { ...state.settings, nodeOrder: action.nodeOrder },
      }
    case ActionTypes.showUpdateNotification:
      return {
        ...state,
        showUpdateNotification: action.showUpdateNotification,
      }
    case ActionTypes.showUpdateDetails:
      if (action.showUpdateDetails === undefined) {
        return state
      }
      return {
        ...state,
        showUpdateDetails: action.showUpdateDetails,
      }
    default:
      return state
  }
}

export default reducer
