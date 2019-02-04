import { Action } from 'redux'
import { createReducer } from './lib'
import * as q from '../../../backend/src/Model'
import { MqttOptions } from '../../../backend/src/DataSource'
import { TopicViewModel } from '../TopicViewModel'
import { ConnnectionOptions } from '../model/ConnectionOptions'

export interface ConnectionManagerState {
  connections?: ConnnectionOptions[]
}

export type Action = SetConnections

export enum ActionTypes {
  CONNECTION_MANAGER_SET_CONNECTIONS = 'CONNECTION_MANAGER_SET_CONNECTIONS',
}

export interface SetConnections {
  type: ActionTypes.CONNECTION_MANAGER_SET_CONNECTIONS,
  connections: ConnnectionOptions[]
}

const initialState: ConnectionManagerState = {
  connections: [],
}

export const connectionManagerReducer = createReducer(initialState, {
  CONNECTION_MANAGER_SET_CONNECTIONS: setConnections,
})

function setConnections(state: ConnectionManagerState, action: SetConnections): ConnectionManagerState {
  return {
    ...state,
    connections: action.connections,
  }
}
