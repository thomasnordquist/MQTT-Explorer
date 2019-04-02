import { ActionTypes, AppState, CustomAction } from '../reducers'
import { Dispatch } from 'redux';

export const showError = (error?: string) => ({
  error,
  type: ActionTypes.showError,
})

export const toggleTheme = () => (dispatch: Dispatch<CustomAction>, getState: () => AppState) => {
  dispatch({
    type: getState().globalState.theme === 'light' ? ActionTypes.setDarkTheme : ActionTypes.setLightTheme,
  })
}
