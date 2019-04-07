import { Action, combineReducers, Reducer } from 'redux'
import { connectionManagerReducer, ConnectionManagerState } from './ConnectionManager'
import { connectionReducer, ConnectionState } from './Connection'
import { publishReducer, PublishState } from './Publish'
import { settingsReducer, SettingsState } from './Settings'
import { trackEvent } from '../utils/tracking'
import { treeReducer, TreeState } from './Tree'

export enum ActionTypes {
  showUpdateNotification = 'SHOW_UPDATE_NOTIFICATION',
  showUpdateDetails = 'SHOW_UPDATE_DETAILS',
  showError = 'SHOW_ERROR',
  didLaunch = 'DID_LAUNCH',
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
  launching: boolean
}

const initialGlobalState: GlobalState = {
  showUpdateDetails: false,
  launching: true,
}

const globalState: Reducer<GlobalState | undefined, CustomAction> = (state = initialGlobalState, action) => {
  if (!state) {
    throw Error('No initial state')
  }
  trackEvent(action.type)
  console.log(action.type)
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

  case ActionTypes.didLaunch:
    return {
      ...state,
      launching: false,
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
