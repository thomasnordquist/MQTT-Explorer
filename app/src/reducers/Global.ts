import { Action, Reducer } from 'redux'
import { Record } from 'immutable'
import { trackEvent } from '../utils/tracking'

export enum ActionTypes {
  showUpdateNotification = 'SHOW_UPDATE_NOTIFICATION',
  showUpdateDetails = 'SHOW_UPDATE_DETAILS',
  showError = 'SHOW_ERROR',
  showNotification = 'SHOW_NOTIFICATION',
  didLaunch = 'DID_LAUNCH',
  toggleSettingsVisibility = 'TOGGLE_SETTINGS_VISIBILITY',
}

export interface GlobalAction extends Action {
  type: ActionTypes,
  showUpdateNotification?: boolean
  showUpdateDetails?: boolean
  error?: string
  notification?: string
  settingsVisible: boolean
}

export interface GlobalState {
  showUpdateNotification?: boolean
  showUpdateDetails: boolean
  error?: string
  notification?: string
  launching: boolean
}

const initialGlobalState = Record<GlobalState>({
  showUpdateNotification: false,
  showUpdateDetails: false,
  error: undefined,
  notification: undefined,
  launching: true,
})

export const globalState: Reducer<Record<GlobalState>, GlobalAction> = (state = initialGlobalState(), action): Record<GlobalState> => {
  trackEvent(action.type)
  console.log(action.type)

  switch (action.type) {
  case ActionTypes.showUpdateNotification:
    return state.set('showUpdateNotification', action.showUpdateNotification)

  case ActionTypes.showError:
    return state.set('error', action.error)

  case ActionTypes.showNotification:
    return state.set('notification', action.notification)

  case ActionTypes.didLaunch:
    return state.set('launching', false)

  case ActionTypes.showUpdateDetails:
    if (action.showUpdateDetails === undefined) {
      return state
    }
    return state.set('showUpdateDetails', action.showUpdateDetails)

  default:
    return state
  }
}