import { ActionTypes, CustomAction } from '../reducers'

export const showUpdateNotification = (show: boolean): CustomAction => {
  return {
    type: ActionTypes.showUpdateNotification,
    showUpdateNotification: show,
  }
}

export const showUpdateDetails = (show: boolean): CustomAction => {
  return {
    type: ActionTypes.showUpdateDetails,
    showUpdateDetails: show,
  }
}
