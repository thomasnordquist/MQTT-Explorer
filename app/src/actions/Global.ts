import { ActionTypes } from '../reducers/Global'
import { Dispatch } from 'redux'

export const showError = (error?: string) => ({
  error,
  type: ActionTypes.showError,
})

export const showNotification = (notification?: string) => ({
  notification,
  type: ActionTypes.showNotification,
})

export const didLaunch = () => ({
  type: ActionTypes.didLaunch,
})

export const toggleSettingsVisibility = () => (dispatch: Dispatch<any>) => {
  dispatch({
    type: ActionTypes.toggleSettingsVisibility,
  })
}