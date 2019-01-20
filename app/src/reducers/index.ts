import * as q from '../../../backend/src/Model'

import { Action, Reducer, combineReducers } from 'redux'

import { trackEvent } from '../tracking'
import { MqttOptions } from '../../../backend/src/DataSource'
import { PublishState, publishReducer } from './Publish'

export enum ActionTypes {
  disconnect = 'DISCONNECT',
  showError = 'SHOW_ERROR',
  setAutoExpandLimit = 'SET_AUTO_EXPAND_LIMIT',
  toggleSettingsVisibility = 'TOGGLE_SETTINGS_VISIBILITY',
  setNodeOrder = 'SET_NODE_ORDER',
  selectTopic = 'SELECT_TOPIC',
  showUpdateNotification = 'SHOW_UPDATE_NOTIFICATION',
  showUpdateDetails = 'SHOW_UPDATE_DETAILS',
  connecting = 'CONNECTING',
  connected = 'CONNECTED',
}

export interface CustomAction extends Action {
  type: ActionTypes,
  autoExpandLimit?: number
  nodeOrder?: NodeOrder
  selectedTopic?: q.TreeNode
  showUpdateNotification?: boolean
  showUpdateDetails?: boolean
  connectionOptions?: MqttOptions
  connectionId?: string
  error?: string
}

export interface AppState {
  tooBigReducer: TooBigOfState
  publish: PublishState
}

export interface TooBigOfState {
  settings: SettingsState,
  selectedTopic?: q.TreeNode
  showUpdateNotification?: boolean
  showUpdateDetails: boolean
  connecting: boolean
  connected: boolean
  error?: string
  connectionId?: string
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

const initialBigState: TooBigOfState = {
  settings: {
    autoExpandLimit: 0,
    nodeOrder: NodeOrder.none,
    visible: false,
  },
  selectedTopic: undefined,
  showUpdateDetails: false,
  connected: false,
  connecting: false,
  error: undefined,
}

const tooBigReducer: Reducer<TooBigOfState | undefined, CustomAction> = (state = initialBigState, action) => {
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

    case ActionTypes.connecting:
      if (!action.connectionId) {
        return state
      }
      return {
        ...state,
        connected: false,
        connecting: true,
        connectionId: action.connectionId,
      }

    case ActionTypes.disconnect:
      return {
        ...state,
        connected: false,
        connecting: false,
        connectionId: undefined,
      }

    case ActionTypes.connected:
      return {
        ...state,
        connected: true,
        connecting: false,
      }

    case ActionTypes.showError:
      return {
        ...state,
        error: action.error,
      }

    default:
      return state
  }
}

const reducer = combineReducers({
  tooBigReducer,
  publish: publishReducer,
})

export default reducer
