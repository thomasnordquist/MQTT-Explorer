import { ActionTypes } from '../reducers'

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
