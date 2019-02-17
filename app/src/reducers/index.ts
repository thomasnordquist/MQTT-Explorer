import { Action, Reducer, combineReducers } from 'redux'

import { trackEvent } from '../tracking'
import { PublishState, publishReducer } from './Publish'
import { ConnectionState, connectionReducer } from './Connection'
import { SettingsState, settingsReducer } from './Settings'
import { TreeState, treeReducer } from './Tree'
import { ConnectionManagerState, connectionManagerReducer } from './ConnectionManager'

export enum ActionTypes {
  showUpdateNotification = 'SHOW_UPDATE_NOTIFICATION',
  showUpdateDetails = 'SHOW_UPDATE_DETAILS',
  showError = 'SHOW_ERROR',
}

export interface CustomAction extends Action {
  type: ActionTypes,
  showUpdateNotification?: boolean
  showUpdateDetails?: boolean
  error?: string
}

export interface AppState {
  globalState: GlobalState
  tree: TreeState
  settings: SettingsState,
  publish: PublishState
  connection: ConnectionState
  connectionManager: ConnectionManagerState
}

export interface GlobalState {
  showUpdateNotification?: boolean
  showUpdateDetails: boolean
  error?: string
}

const initialBigState: GlobalState = {
  showUpdateDetails: false,
}

const globalState: Reducer<GlobalState | undefined, CustomAction> = (state = initialBigState, action) => {
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

    case ActionTypes.showError:
      return {
        ...state,
        error: action.error,
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
  globalState,
  publish: publishReducer,
  connection: connectionReducer,
  settings: settingsReducer,
  tree: treeReducer,
  connectionManager: connectionManagerReducer,
})

export default reducer
