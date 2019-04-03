import { ActionTypes, AppState, CustomAction } from '../reducers'
import { Dispatch } from 'redux'

export const showError = (error?: string) => ({
  error,
  type: ActionTypes.showError,
})

export const didLaunch = () => ({
  type: ActionTypes.didLaunch,
})

