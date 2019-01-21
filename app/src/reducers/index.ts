import * as q from '../../../backend/src/Model'

import { Action, Reducer, combineReducers } from 'redux'

import { trackEvent } from '../tracking'
import { PublishState, publishReducer } from './Publish'
import { ConnectionState, connectionReducer } from './Connection'
import { SettingsState, settingsReducer } from './Settings'

export enum ActionTypes {
  selectTopic = 'SELECT_TOPIC',
  showUpdateNotification = 'SHOW_UPDATE_NOTIFICATION',
  showUpdateDetails = 'SHOW_UPDATE_DETAILS',
}

export interface CustomAction extends Action {
  type: ActionTypes,
  selectedTopic?: q.TreeNode
  showUpdateNotification?: boolean
  showUpdateDetails?: boolean
}

export interface AppState {
  tooBigReducer: TooBigOfState
  settings: SettingsState,
  publish: PublishState
  connection: ConnectionState
}

export interface TooBigOfState {
  selectedTopic?: q.TreeNode
  showUpdateNotification?: boolean
  showUpdateDetails: boolean
}

const initialBigState: TooBigOfState = {
  selectedTopic: undefined,
  showUpdateDetails: false,
}

const tooBigReducer: Reducer<TooBigOfState | undefined, CustomAction> = (state = initialBigState, action) => {
  if (!state) {
    throw Error('No initial state')
  }
  trackEvent(action.type)
  console.log(action, state)
  switch (action.type) {
    case ActionTypes.selectTopic:
      if (!action.selectedTopic) {
        return state
      }
      return {
        ...state,
        selectedTopic: action.selectedTopic,
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

const reducer = combineReducers({
  tooBigReducer,
  publish: publishReducer,
  connection: connectionReducer,
  settings: settingsReducer,
})

export default reducer
