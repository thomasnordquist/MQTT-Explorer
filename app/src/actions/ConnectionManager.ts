import { AppState } from '../reducers'
import { clearLegacyConnectionOptions, loadLegacyConnectionOptions } from '../model/LegacyConnectionSettings'
import {
  ConnectionOptions,
  createEmptyConnection,
  makeDefaultConnections,
  CertificateParameters,
} from '../model/ConnectionOptions'
import { default as persistentStorage, StorageIdentifier } from '../utils/PersistentStorage'
import { Dispatch } from 'redux'
import { showError } from './Global'
import { remote } from 'electron'
import { promises as fsPromise } from 'fs'
import * as path from 'path'

import { ActionTypes, Action } from '../reducers/ConnectionManager'

interface ConnectionDictionary {
  [s: string]: ConnectionOptions
}
const storedConnectionsIdentifier: StorageIdentifier<ConnectionDictionary> = {
  id: 'ConnectionManager_connections',
}

export const loadConnectionSettings = () => async (dispatch: Dispatch<any>, getState: () => AppState) => {
  let connections
  try {
    await ensureConnectionsHaveBeenInitialized()
    connections = await persistentStorage.load(storedConnectionsIdentifier)
  } catch (error) {
    dispatch(showError(error))
  }

  if (!connections) {
    return
  }

  dispatch(setConnections(connections))
  const firstKey = Object.keys(connections)[0]
  if (firstKey) {
    dispatch(selectConnection(firstKey))
  }
}

export type CertificateTypes = 'selfSignedCertificate' | 'clientCertificate' | 'clientKey'
export const selectCertificate = (type: CertificateTypes, connectionId: string) => async (
  dispatch: Dispatch<any>,
  getState: () => AppState
) => {
  try {
    const certificate = await openCertificate()
    dispatch(
      updateConnection(connectionId, {
        [type]: certificate,
      })
    )
  } catch (error) {
    dispatch(showError(error))
  }
}

async function openCertificate(): Promise<CertificateParameters> {
  const rejectReasons = {
    noCertificateSelected: 'No certificate selected',
    certificateSizeDoesNotMatch: 'Certificate size larger/smaller then expected.',
  }

  const openDialogReturnValue = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
    properties: ['openFile'],
    securityScopedBookmarks: true,
  })

  const selectedFile = openDialogReturnValue.filePaths && openDialogReturnValue.filePaths[0]
  if (!selectedFile) {
    throw rejectReasons.noCertificateSelected
  }

  const data = await fsPromise.readFile(selectedFile)
  if (data.length > 16_384 || data.length < 128) {
    throw rejectReasons.certificateSizeDoesNotMatch
  }

  return {
    data: data.toString('base64'),
    name: path.basename(selectedFile),
  }
}

export const saveConnectionSettings = () => async (dispatch: Dispatch<any>, getState: () => AppState) => {
  try {
    console.log('store settings')
    await persistentStorage.store(storedConnectionsIdentifier, getState().connectionManager.connections)
  } catch (error) {
    dispatch(showError(error))
  }
}

export const updateConnection = (connectionId: string, changeSet: Partial<ConnectionOptions>): Action => ({
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

export const createConnection = () => (dispatch: Dispatch<any>) => {
  const newConnection = createEmptyConnection()
  dispatch(addConnection(newConnection))
  dispatch(selectConnection(newConnection.id))
}

export const setConnections = (connections: { [s: string]: ConnectionOptions }): Action => ({
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

export const toggleAdvancedSettings = (): Action => ({
  type: ActionTypes.CONNECTION_MANAGER_TOGGLE_ADVANCED_SETTINGS,
})

export const toggleCertificateSettings = (): Action => ({
  type: ActionTypes.CONNECTION_MANAGER_TOGGLE_CERTIFICATE_SETTINGS,
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

async function ensureConnectionsHaveBeenInitialized() {
  let connections = await persistentStorage.load(storedConnectionsIdentifier)
  const requiresInitialization = !connections
  if (requiresInitialization) {
    const migratedConnection = loadLegacyConnectionOptions()
    const defaultConnections = makeDefaultConnections()
    connections = {
      ...migratedConnection,
      ...defaultConnections,
    }
    await persistentStorage.store(storedConnectionsIdentifier, connections)

    clearLegacyConnectionOptions()
  }

  // Migrate connections, rewrite dictionary to "keep" it "ordered" (dictionaries do not have a guaranteed order)
  const mayNeedMigrations = connections && connections['iot.eclipse.org']
  if (connections && mayNeedMigrations) {
    const newConnections = {}
    for (const connection of Object.values(connections)) {
      addMigratedConnection(newConnections, connection)
    }

    await persistentStorage.store(storedConnectionsIdentifier, newConnections)
  }
}

function addMigratedConnection(newConnections: { [key: string]: ConnectionOptions }, connection: ConnectionOptions) {
  // The host has been renamed, only change the host if it has not been changed
  // Also check for ssl since SSL is not yet working
  if (
    connection.id === 'iot.eclipse.org' &&
    connection.host === 'iot.eclipse.org' &&
    connection.port === 1883 &&
    !connection.encryption
  ) {
    connection.id = 'mqtt.eclipse.org'
    connection.host = 'mqtt.eclipse.org'
    connection.name = 'mqtt.eclipse.org'
  }
  newConnections[connection.id] = connection
}
