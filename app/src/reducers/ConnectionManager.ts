import { ConnectionOptions } from '../model/ConnectionOptions'
import { createReducer } from './lib'
import { Subscription } from '../../../backend/src/DataSource/MqttSource'

export interface ConnectionManagerState {
  connections: { [s: string]: ConnectionOptions }
  selected?: string
  showAdvancedSettings: boolean
  showCertificateSettings: boolean
}

const initialState: ConnectionManagerState = {
  connections: {},
  selected: undefined,
  showAdvancedSettings: false,
  showCertificateSettings: false,
}

export type Action =
  | SetConnections
  | SelectConnection
  | UpdateConnection
  | AddConnection
  | DeleteConnection
  | ToggleAdvancedSettings
  | ToggleCertificateSettings
  | DeleteSubscription
  | AddSubscription
  | MoveConnection

export enum ActionTypes {
  CONNECTION_MANAGER_SET_CONNECTIONS = 'CONNECTION_MANAGER_SET_CONNECTIONS',
  CONNECTION_MANAGER_SELECT_CONNECTION = 'CONNECTION_MANAGER_SELECT_CONNECTION',
  CONNECTION_MANAGER_UPDATE_CONNECTION = 'CONNECTION_MANAGER_UPDATE_CONNECTION',
  CONNECTION_MANAGER_ADD_CONNECTION = 'CONNECTION_MANAGER_ADD_CONNECTION',
  CONNECTION_MANAGER_DELETE_CONNECTION = 'CONNECTION_MANAGER_DELETE_CONNECTION',
  CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS = 'CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS',
  CONNECTION_MANAGER_TOGGLE_CERTIFICATE_SETTINGS = 'CONNECTION_MANAGER_TOGGLE_CERTIFICATE_SETTINGS',
  CONNECTION_MANAGER_ADD_SUBSCRIPTION = 'CONNECTION_MANAGER_ADD_SUBSCRIPTION',
  CONNECTION_MANAGER_DELETE_SUBSCRIPTION = 'CONNECTION_MANAGER_DELETE_SUBSCRIPTION',
  CONNECTION_MANAGER_MOVE_CONNECTION = 'CONNECTION_MANAGER_MOVE_CONNECTION',
}

export interface SetConnections {
  type: ActionTypes.CONNECTION_MANAGER_SET_CONNECTIONS
  connections: { [s: string]: ConnectionOptions }
}

export interface SelectConnection {
  type: ActionTypes.CONNECTION_MANAGER_SELECT_CONNECTION
  selected: string
}

export interface AddSubscription {
  type: ActionTypes.CONNECTION_MANAGER_ADD_SUBSCRIPTION
  subscription: Subscription
  connectionId: string
}

export interface DeleteSubscription {
  type: ActionTypes.CONNECTION_MANAGER_DELETE_SUBSCRIPTION
  subscription: Subscription
  connectionId: string
}

export interface UpdateConnection {
  type: ActionTypes.CONNECTION_MANAGER_UPDATE_CONNECTION
  connectionId: string
  changeSet: any
}

export interface AddConnection {
  type: ActionTypes.CONNECTION_MANAGER_ADD_CONNECTION
  connection: ConnectionOptions
}

export interface DeleteConnection {
  type: ActionTypes.CONNECTION_MANAGER_DELETE_CONNECTION
  connectionId: string
}

export interface ToggleAdvancedSettings {
  type: ActionTypes.CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS
}

export interface ToggleCertificateSettings {
  type: ActionTypes.CONNECTION_MANAGER_TOGGLE_CERTIFICATE_SETTINGS
}

export interface MoveConnection {
  type: ActionTypes.CONNECTION_MANAGER_MOVE_CONNECTION
  connectionId: string
  direction: 'up' | 'down'
}

export const connectionManagerReducer = createReducer(initialState, {
  CONNECTION_MANAGER_SET_CONNECTIONS: setConnections,
  CONNECTION_MANAGER_SELECT_CONNECTION: selectConnection,
  CONNECTION_MANAGER_UPDATE_CONNECTION: updateConnection,
  CONNECTION_MANAGER_ADD_CONNECTION: addConnection,
  CONNECTION_MANAGER_DELETE_CONNECTION: deleteConnection,
  CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS: toggleAdvancedSettings,
  CONNECTION_MANAGER_TOGGLE_CERTIFICATE_SETTINGS: toggleCertificateSettings,
  CONNECTION_MANAGER_DELETE_SUBSCRIPTION: deleteSubscription,
  CONNECTION_MANAGER_ADD_SUBSCRIPTION: addSubscription,
  CONNECTION_MANAGER_MOVE_CONNECTION: moveConnection,
})

function setConnections(state: ConnectionManagerState, action: SetConnections): ConnectionManagerState {
  return {
    ...state,
    connections: action.connections,
  }
}

function selectConnection(state: ConnectionManagerState, action: SelectConnection): ConnectionManagerState {
  return {
    ...state,
    selected: action.selected,
  }
}

function toggleAdvancedSettings(state: ConnectionManagerState, action: ToggleAdvancedSettings): ConnectionManagerState {
  return {
    ...state,
    showAdvancedSettings: !state.showAdvancedSettings,
  }
}

function toggleCertificateSettings(
  state: ConnectionManagerState,
  action: ToggleCertificateSettings
): ConnectionManagerState {
  return {
    ...state,
    showCertificateSettings: !state.showCertificateSettings,
  }
}

function addConnection(state: ConnectionManagerState, action: AddConnection): ConnectionManagerState {
  return {
    ...state,
    connections: {
      ...state.connections,
      [action.connection.id]: action.connection,
    },
  }
}

function addSubscription(state: ConnectionManagerState, action: AddSubscription): ConnectionManagerState {
  const connection = state.connections[action.connectionId]
  const alreadyExists = connection.subscriptions.indexOf(action.subscription) !== -1
  if (alreadyExists) {
    return state
  }

  const newSubscriptions = connection.subscriptions.slice()
  newSubscriptions.push(action.subscription)
  return {
    ...state,
    connections: {
      ...state.connections,
      [action.connectionId]: {
        ...connection,
        subscriptions: newSubscriptions,
      },
    },
  }
}

function deleteSubscription(state: ConnectionManagerState, action: AddSubscription): ConnectionManagerState {
  function subscriptionsEqual(v1: Subscription, v2: Subscription): boolean {
    return v1.topic == v2.topic && v1.qos == v2.qos
  }

  const connection = state.connections[action.connectionId]
  const newSubscriptions = connection.subscriptions.filter(s => !subscriptionsEqual(s, action.subscription))

  return {
    ...state,
    connections: {
      ...state.connections,
      [action.connectionId]: {
        ...connection,
        subscriptions: newSubscriptions,
      },
    },
  }
}

function deleteConnection(state: ConnectionManagerState, action: DeleteConnection): ConnectionManagerState {
  const connections = { ...state.connections }
  delete connections[action.connectionId]

  return {
    ...state,
    connections,
  }
}

function updateConnection(state: ConnectionManagerState, action: UpdateConnection): ConnectionManagerState {
  let connection = state.connections[action.connectionId]
  let changeSet = action.changeSet

  // Reset empty username to undefined
  if (changeSet.username !== undefined) {
    changeSet = {
      changeSet,
      username: changeSet.username === '' ? undefined : changeSet.username,
    }
  }

  // Reset empty password to undefined
  if (changeSet.password !== undefined) {
    changeSet = {
      changeSet,
      password: changeSet.password === '' ? undefined : changeSet.password,
    }
  }

  connection = {
    ...connection,
    ...changeSet,
  }

  return {
    ...state,
    connections: {
      ...state.connections,
      [action.connectionId]: connection,
    },
  }
}

function moveConnection(state: ConnectionManagerState, action: MoveConnection): ConnectionManagerState {
  const connections = Object.values(state.connections).sort((a, b) => (a.order || 0) - (b.order || 0))
  const currentIndex = connections.findIndex(c => c.id === action.connectionId)

  if (currentIndex === -1) {
    return state
  }

  const targetIndex = action.direction === 'up' ? currentIndex - 1 : currentIndex + 1

  // Can't move beyond bounds
  if (targetIndex < 0 || targetIndex >= connections.length) {
    return state
  }

  // Swap order values
  const currentConnection = connections[currentIndex]
  const targetConnection = connections[targetIndex]
  const currentOrder = currentConnection.order || 0
  const targetOrder = targetConnection.order || 0

  return {
    ...state,
    connections: {
      ...state.connections,
      [currentConnection.id]: {
        ...currentConnection,
        order: targetOrder,
      },
      [targetConnection.id]: {
        ...targetConnection,
        order: currentOrder,
      },
    },
  }
}
