import { Action, combineReducers, Reducer } from 'redux'
import { connectionManagerReducer, ConnectionManagerState } from './ConnectionManager'
import { connectionReducer, ConnectionState } from './Connection'
import { publishReducer, PublishState } from './Publish'
import { settingsReducer, SettingsState } from './Settings'
import { trackEvent } from '../tracking'
import { treeReducer, TreeState } from './Tree'

export enum ActionTypes {
  showUpdateNotification = 'SHOW_UPDATE_NOTIFICATION',
  showUpdateDetails = 'SHOW_UPDATE_DETAILS',
  showError = 'SHOW_ERROR',
  setDarkTheme = 'GLOBAL_SET_DARK_THEME',
  setLightTheme = 'GLOBAL_SET_LIGHT_THEME',
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
  theme: 'light' | 'dark'
}

const initialGlobalState: GlobalState = {
  showUpdateDetails: false,
  theme: 'dark',
}

const globalState: Reducer<GlobalState | undefined, CustomAction> = (state = initialGlobalState, action) => {
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

    case ActionTypes.setDarkTheme:
      return {
        ...state,
        theme: 'dark',
      }

    case ActionTypes.setLightTheme:
      return {
        ...state,
        theme: 'light',
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
