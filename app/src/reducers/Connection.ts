import * as q from '../../../backend/src/Model'
import { MqttOptions } from 'mqtt-explorer-backend/src/DataSource/DataSource'
import { createReducer } from './lib'
import { TopicViewModel } from '../model/TopicViewModel'

export type ConnectionHealth = 'offline' | 'online' | 'connecting'
export interface ConnectionState {
  host?: string
  tree?: q.Tree<TopicViewModel>
  connectionOptions?: MqttOptions
  connectionId?: string
  error?: string
  connected: boolean
  connecting: boolean
  health?: ConnectionHealth
}

export type Action = SetConnecting | SetConnected | SetDisconnected | ShowError

export enum ActionTypes {
  CONNECTION_SET_CONNECTING = 'CONNECTION_SET_CONNECTING',
  CONNECTION_SET_CONNECTED = 'CONNECTION_SET_CONNECTED',
  CONNECTION_SET_DISCONNECTED = 'CONNECTION_SET_DISCONNECTED',
  CONNECTION_SET_SHOW_ERROR = 'CONNECTION_SET_SHOW_ERROR',
  CONNECTION_SET_HEALTH = 'CONNECTION_SET_HEALTH',
}

export interface SetConnecting {
  type: ActionTypes.CONNECTION_SET_CONNECTING
  connectionId: string
}

export interface SetConnected {
  type: ActionTypes.CONNECTION_SET_CONNECTED
  host: string
  tree: q.Tree<TopicViewModel>
}

export interface SetDisconnected {
  type: ActionTypes.CONNECTION_SET_DISCONNECTED
}

export interface SetHealth {
  health: ConnectionHealth
  type: ActionTypes.CONNECTION_SET_DISCONNECTED
}

export interface ShowError {
  type: ActionTypes.CONNECTION_SET_SHOW_ERROR
  error?: Error
}

const initialState: ConnectionState = {
  connected: false,
  connecting: false,
  health: undefined,
}

export const connectionReducer = createReducer(initialState, {
  CONNECTION_SET_CONNECTING: setConnecting,
  CONNECTION_SET_CONNECTED: setConnected,
  CONNECTION_SET_DISCONNECTED: setDisconnected,
  CONNECTION_SET_SHOW_ERROR: showError,
  CONNECTION_SET_HEALTH: setHealth,
})

function setConnecting(state: ConnectionState, action: SetConnecting): ConnectionState {
  return {
    ...state,
    connecting: true,
    connected: false,
    connectionId: action.connectionId,
  }
}

function setHealth(state: ConnectionState, action: SetHealth): ConnectionState {
  return {
    ...state,
    health: action.health,
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
