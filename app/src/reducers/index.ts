import { Reducer, Action } from 'redux'
import * as q from '../../../backend/src/Model'

export enum ActionTypes {
  setAutoExpandLimit = 'SET_AUTO_EXPAND_LIMIT',
  toggleSettingsVisibility = 'TOGGLE_SETTINGS_VISIBILITY',
  setNodeOrder = 'SET_NODE_ORDER',
  selectTopic = 'SELECT_TOPIC',
}

interface CustomAction extends Action {
  type: ActionTypes,
  autoExpandLimit?: number
  nodeOrder?: NodeOrder
  selectedTopic?: q.TreeNode
}

export interface AppState {
  settings: SettingsState,
  selectedTopic?: q.TreeNode
}

export interface SettingsState {
  autoExpandLimit: number
  visible: boolean
  nodeOrder: NodeOrder
}

export enum NodeOrder {
  none = 'none',
  messages = '#messages',
  abc = 'abc',
  topics = '#topics',
}

const reducer: Reducer<AppState | undefined, CustomAction> = (state, action) => {
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
    case ActionTypes.selectTopic:
      if (!action.selectedTopic) {
        return state
      }
      return {
        ...state,
        settings: state.settings,
        selectedTopic: action.selectedTopic,
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
