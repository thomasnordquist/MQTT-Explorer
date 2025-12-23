import { ActionTypes, GlobalAction } from '../reducers/Global'

export const showUpdateNotification = (show: boolean): GlobalAction => {
  return {
    type: ActionTypes.showUpdateNotification,
    showUpdateNotification: show,
  }
}

export const showUpdateDetails = (show: boolean): GlobalAction => {
  return {
    type: ActionTypes.showUpdateDetails,
    showUpdateDetails: show,
  }
}
