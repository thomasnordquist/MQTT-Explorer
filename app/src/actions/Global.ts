import { ActionTypes, ConfirmationRequest } from '../reducers/Global'
import { Dispatch } from 'redux'

export const showError = (error?: string | unknown) => ({
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

export const toggleAboutDialogVisibility = () => (dispatch: Dispatch<any>) => {
  dispatch({
    type: ActionTypes.toggleAboutDialogVisibility,
  })
}

export const requestConfirmation = (title: string, inquiry: string) => (dispatch: Dispatch<any>) => {
  return new Promise(resolve => {
    const confirmationRequest = {
      title,
      inquiry,
      callback: (confirmed: boolean) => {
        resolve(confirmed)
        dispatch(removeConfirmationRequest(confirmationRequest))
      },
    }

    dispatch({
      confirmationRequest,
      type: ActionTypes.requestConfirmation,
    })
  })
}

export const removeConfirmationRequest = (confirmationRequest: ConfirmationRequest) => (dispatch: Dispatch<any>) => {
  return new Promise((resolve, reject) => {
    dispatch({
      confirmationRequest,
      type: ActionTypes.removeConfirmationRequest,
    })
  })
}
