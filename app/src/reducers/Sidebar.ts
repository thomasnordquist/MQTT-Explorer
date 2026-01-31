import { Action as ReduxAction } from 'redux'
import { Record } from 'immutable'
import * as q from '../../../backend/src/Model'
import { createReducer } from './lib'

interface SidebarModel {
  compareMessage?: q.Message
}

const initialStateFactory = Record<SidebarModel>({
  compareMessage: undefined,
})

export type Action = SetCompareMessage | ResetStore

export enum ActionTypes {
  SIDEBAR_SET_COMPARE_MESSAGE = 'SIDEBAR_SET_COMPARE_MESSAGE',
  SIDEBAR_RESET_STORE = 'SIDEBAR_RESET_STORE',
}

export type SidebarState = Record<SidebarModel>

const actions: {
  [s: string]: any
} = {
  SIDEBAR_SET_COMPARE_MESSAGE: setCompareMessage,
  SIDEBAR_RESET_STORE: resetStore,
}

export const sidebarReducer = createReducer(initialStateFactory(), actions)

export interface SetCompareMessage {
  type: ActionTypes.SIDEBAR_SET_COMPARE_MESSAGE
  message?: q.Message
}

function setCompareMessage(state: SidebarState, action: SetCompareMessage): SidebarState {
  return state.set('compareMessage', action.message)
}

export interface ResetStore {
  type: ActionTypes.SIDEBAR_RESET_STORE
}

function resetStore(): SidebarState {
  return initialStateFactory()
}
