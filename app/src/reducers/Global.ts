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
  requestConfirmation = 'REQUEST_CONFIRMATION',
  removeConfirmationRequest = 'REMOVE_CONFIRMATION_REQUEST',
}

export interface ConfirmationRequest {
  inquiry: string
  title: string
  callback: (confirmed: boolean) => void
}

export interface GlobalAction extends Action {
  type: ActionTypes
  showUpdateNotification?: boolean
  showUpdateDetails?: boolean
  error?: string
  notification?: string
  confirmationRequest?: ConfirmationRequest
}

interface GlobalStateInterface {
  showUpdateNotification?: boolean
  showUpdateDetails: boolean
  error?: string
  notification?: string
  launching: boolean
  settingsVisible: boolean
  confirmationRequests: Array<ConfirmationRequest>
}

export type GlobalState = Record<GlobalStateInterface>

const initialStateFactory = Record<GlobalStateInterface>({
  showUpdateNotification: false,
  showUpdateDetails: false,
  error: undefined,
  notification: undefined,
  launching: true,
  settingsVisible: false,
  confirmationRequests: [],
})

export const globalState: Reducer<Record<GlobalStateInterface>, GlobalAction> = (
  state = initialStateFactory(),
  action,
): GlobalState => {
  trackEvent(action.type)

  switch (action.type) {
    case ActionTypes.showUpdateNotification:
      return state.set('showUpdateNotification', action.showUpdateNotification)

    case ActionTypes.toggleSettingsVisibility:
      return state.set('settingsVisible', !state.get('settingsVisible'))

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

    case ActionTypes.requestConfirmation:
      if (action.confirmationRequest === undefined) {
        return state
      }
      return state.set('confirmationRequests', [...state.get('confirmationRequests'), action.confirmationRequest])

    case ActionTypes.removeConfirmationRequest:
      if (action.confirmationRequest === undefined) {
        return state
      }
      return state.set(
        'confirmationRequests',
        state.get('confirmationRequests').filter((a) => a !== action.confirmationRequest),
      )

    default:
      return state
  }
}
