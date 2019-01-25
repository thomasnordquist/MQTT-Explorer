import { Action, Reducer, combineReducers } from 'redux'

import { trackEvent } from '../tracking'
import { PublishState, publishReducer } from './Publish'
import { ConnectionState, connectionReducer } from './Connection'
import { SettingsState, settingsReducer } from './Settings'
import { TreeState, treeReducer } from './Tree'

export enum ActionTypes {
  showUpdateNotification = 'SHOW_UPDATE_NOTIFICATION',
  showUpdateDetails = 'SHOW_UPDATE_DETAILS',
}

export interface CustomAction extends Action {
  type: ActionTypes,
  showUpdateNotification?: boolean
  showUpdateDetails?: boolean
}

export interface AppState {
  tooBigReducer: TooBigOfState
  tree: TreeState
  settings: SettingsState,
  publish: PublishState
  connection: ConnectionState
}

export interface TooBigOfState {
  showUpdateNotification?: boolean
  showUpdateDetails: boolean
}

const initialBigState: TooBigOfState = {
  showUpdateDetails: false,
}

const tooBigReducer: Reducer<TooBigOfState | undefined, CustomAction> = (state = initialBigState, action) => {
  if (!state) {
    throw Error('No initial state')
  }
  trackEvent(action.type)

  switch (action.type) {
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
  tree: treeReducer,
})

export default reducer
