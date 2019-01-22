import { Action } from 'redux'
import { createReducer } from './lib'
import * as q from '../../../backend/src/Model'
import { MqttOptions } from '../../../backend/src/DataSource'

export interface ConnectionState {
  host?: string
  tree?: q.Tree
  connectionOptions?: MqttOptions
  connectionId?: string
  error?: string
  connected: boolean
  connecting: boolean
}

export type Action = SetConnecting | SetConnected | SetDisconnected | ShowError

export enum ActionTypes {
  CONNECTION_SET_CONNECTING = 'CONNECTION_SET_CONNECTING',
  CONNECTION_SET_CONNECTED = 'CONNECTION_SET_CONNECTED',
  CONNECTION_SET_DISCONNECTED = 'CONNECTION_SET_DISCONNECTED',
  CONNECTION_SET_SHOW_ERROR = 'CONNECTION_SET_SHOW_ERROR',
}

export interface SetConnecting {
  type: ActionTypes.CONNECTION_SET_CONNECTING,
  connectionId: string
}

export interface SetConnected {
  type: ActionTypes.CONNECTION_SET_CONNECTED
  host: string
  tree: q.Tree
}

export interface SetDisconnected {
  type: ActionTypes.CONNECTION_SET_DISCONNECTED
}

export interface ShowError {
  type: ActionTypes.CONNECTION_SET_SHOW_ERROR
  error?: Error
}

const initialState: ConnectionState = {
  connected: false,
  connecting: false,
}

export const connectionReducer = createReducer(initialState, {
  CONNECTION_SET_CONNECTING: setConnecting,
  CONNECTION_SET_CONNECTED: setConnected,
  CONNECTION_SET_DISCONNECTED: setDisconnected,
  CONNECTION_SET_SHOW_ERROR: showError,
})

function setConnecting(state: ConnectionState, action: SetConnecting): ConnectionState {
  return {
    ...state,
    connecting: true,
    connected: false,
    connectionId: action.connectionId,
  }
}

function setConnected(state: ConnectionState, action: SetConnected): ConnectionState {
  return {
    ...state,
    host: action.host,
    connecting: false,
    connected: true,
    tree: action.tree,
  }
}

function setDisconnected(state: ConnectionState, action: SetDisconnected): ConnectionState {
  return {
    ...state,
    host: undefined,
    connecting: false,
    connected: false,
    connectionId: undefined,
    tree: undefined,
  }
}

function showError(state: ConnectionState, action: ShowError) {
  return {
    ...state,
    error: action.error,
  }
}
