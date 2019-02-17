import { AppState } from '../reducers'
import { ConnectionOptions, createEmptyConnection, makeDefaultConnections } from '../model/ConnectionOptions'
import { default as persistantStorage, StorageIdentifier } from '../PersistantStorage'
import { Dispatch } from 'redux'
import { loadLegacyConnectionOptions, clearLegacyConnectionOptions } from '../model/LegacyConnectionSettings'
import {
  ActionTypes,
  Action,
} from '../reducers/ConnectionManager'

const storedConnectionsIdentifier: StorageIdentifier<{[s: string]: ConnectionOptions}> = {
  id: 'ConnectionManager_connections',
}

export const loadConnectionSettings = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  ensureConnectionsHaveBeenInitialized()
  const connections = persistantStorage.load(storedConnectionsIdentifier)

  if (!connections) {
    return
  }

  dispatch(setConnections(connections))
  const firstKey = Object.keys(connections)[0]
  if (firstKey) {
    dispatch(selectConnection(firstKey))
  }
}

export const saveConnectionSettings = () => (_dispatch: Dispatch<any>, getState: () => AppState) => {
  persistantStorage.store(storedConnectionsIdentifier, getState().connectionManager.connections)
}

export const updateConnection = (connectionId: string, changeSet: any): Action => ({
  connectionId,
  changeSet,
  type: ActionTypes.CONNECTION_MANAGER_UPDATE_CONNECTION,
})

export const addSubscription = (subscription: string, connectionId: string): Action => ({
  connectionId,
  subscription,
  type: ActionTypes.CONNECTION_MANAGER_ADD_SUBSCRIPTION,
})

export const deleteSubscription = (subscription: string, connectionId: string): Action => ({
  connectionId,
  subscription,
  type: ActionTypes.CONNECTION_MANAGER_DELETE_SUBSCRIPTION,
})

export const createConnection = () => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const newConnection = createEmptyConnection()
  dispatch(addConnection(newConnection))
  dispatch(selectConnection(newConnection.id))
}

export const setConnections = (connections: {[s: string]: ConnectionOptions}): Action => ({
  connections,
  type: ActionTypes.CONNECTION_MANAGER_SET_CONNECTIONS,
})

export const selectConnection = (connectionId: string): Action => ({
  selected: connectionId,
  type: ActionTypes.CONNECTION_MANAGER_SELECT_CONNECTION,
})

export const addConnection = (connection: ConnectionOptions): Action => ({
  connection,
  type: ActionTypes.CONNECTION_MANAGER_ADD_CONNECTION,
})

export const toggleAdvancedSettings = (): Action  => ({
  type: ActionTypes.CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS,
})

export const deleteConnection = (connectionId: string) => (dispatch: Dispatch<any>, getState: () => AppState) => {
  const connectionIds = Object.keys(getState().connectionManager.connections)
  const connectionIdLocation = connectionIds.indexOf(connectionId)

  const remainingIds = connectionIds.filter(id => id !== connectionId)
  const nextSelectedConnectionIndex = Math.min(remainingIds.length - 1, connectionIdLocation)
  const nextSelectedConnection = remainingIds[nextSelectedConnectionIndex]

  dispatch({
    connectionId,
    type: ActionTypes.CONNECTION_MANAGER_DELETE_CONNECTION,
  })

  if (nextSelectedConnection) {
    dispatch(selectConnection(nextSelectedConnection))
  }
}

function ensureConnectionsHaveBeenInitialized() {
  const connections = persistantStorage.load(storedConnectionsIdentifier)

  const requiresInitialization = !connections
  if (requiresInitialization) {
    const migratedConnection = loadLegacyConnectionOptions()
    const defaultConnections = makeDefaultConnections()
    persistantStorage.store(storedConnectionsIdentifier, {
      ...migratedConnection,
      ...defaultConnections,
    })

    clearLegacyConnectionOptions()
  }
}
