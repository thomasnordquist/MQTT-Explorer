import { Reducer, Action } from 'redux'

export enum ActionTypes {
  setAutoExpandLimit = 'SET_AUTO_EXPAND_LIMIT',
  toggleSettingsVisibility = 'TOGGLE_SETTINGS_VISIBILITY',
}

interface SettingsAction extends Action {
  type: ActionTypes,
  autoExpandLimit: number
}

export interface AppState {
  settings: SettingsModel
}

export interface SettingsModel {
  autoExpandLimit: number
  visible: boolean
}

const reducer: Reducer<AppState | undefined, SettingsAction> = (state, action) => {
  if (!state) {
    throw Error('No initial state')
  }
  console.log(action)

  switch (action.type) {
    case ActionTypes.setAutoExpandLimit:
      return {
        ...state,
        settings: {
          visible: state.settings.visible,
          autoExpandLimit: action.autoExpandLimit,
        },
      }
    case ActionTypes.toggleSettingsVisibility:
      return {
        ...state,
        settings: {
          visible: !state.settings.visible,
          autoExpandLimit: state.settings.autoExpandLimit,
        },
      }
    default:
      return state
  }
}

export default reducer
