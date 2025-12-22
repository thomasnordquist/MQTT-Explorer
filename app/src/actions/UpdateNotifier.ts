import { ActionTypes, GlobalAction } from '../reducers/Global'

export const showUpdateNotification = (show: boolean): GlobalAction => ({
  type: ActionTypes.showUpdateNotification,
  showUpdateNotification: show,
})

export const showUpdateDetails = (show: boolean): GlobalAction => ({
  type: ActionTypes.showUpdateDetails,
  showUpdateDetails: show,
})
