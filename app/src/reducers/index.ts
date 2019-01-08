import { Reducer, Action } from 'redux'

export enum ActionTypes {
  setAutoExpandLimit = 'SET_AUTO_EXPAND_LIMIT',
  toggleSettingsVisibility = 'TOGGLE_SETTINGS_VISIBILITY',
  setNodeOrder = 'SET_NODE_ORDER',
}

interface SettingsAction extends Action {
  type: ActionTypes,
  autoExpandLimit?: number
  nodeOrder?: NodeOrder
}

export interface AppState {
  settings: SettingsModel
}

export enum NodeOrder {
  none = 'none',
  messages = '#messages',
  abc = 'abc',
  topics = '#topics',
}

export interface SettingsModel {
  autoExpandLimit: number
  visible: boolean
  nodeOrder: NodeOrder
}

const reducer: Reducer<AppState | undefined, SettingsAction> = (state, action) => {
  if (!state) {
    throw Error('No initial state')
  }
  console.log(action)

  switch (action.type) {
    case ActionTypes.setAutoExpandLimit:
      if (!action.autoExpandLimit) {
        return state
      }
      return {
        ...state,
        settings: {
          visible: state.settings.visible,
          autoExpandLimit: action.autoExpandLimit,
          nodeOrder: state.settings.nodeOrder,
        },
      }
    case ActionTypes.toggleSettingsVisibility:
      return {
        ...state,
        settings: {
          visible: !state.settings.visible,
          autoExpandLimit: state.settings.autoExpandLimit,
          nodeOrder: state.settings.nodeOrder,
        },
      }
    case ActionTypes.setNodeOrder:
      if (!action.nodeOrder) {
        return state
      }
      return {
        ...state,
        settings: {
          visible: state.settings.visible,
          autoExpandLimit: state.settings.autoExpandLimit,
          nodeOrder: action.nodeOrder,
        },
      }
    default:
      return state
  }
}

export default reducer
