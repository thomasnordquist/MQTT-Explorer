import { ActionTypes } from '../reducers'

export const showError = (error?: string) => ({
  error,
  type: ActionTypes.showError,
})
