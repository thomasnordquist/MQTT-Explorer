import { Action } from 'redux'
import { ActionTypes } from '../reducers'

export const setAutoExpandLimit = (autoExpandLimit: number = 0) => {
  return {
    autoExpandLimit,
    type: ActionTypes.setAutoExpandLimit,
  }
}

export const toggleSettingsVisibility = () => {
  return {
    type: ActionTypes.toggleSettingsVisibility,
  }
}
