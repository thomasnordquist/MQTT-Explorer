import { AppState } from '../reducers'
import { clearLegacyConnectionOptions, loadLegacyConnectionOptions } from '../model/LegacyConnectionSettings'
import { ConnectionOptions, createEmptyConnection, makeDefaultConnections, CertificateParameters } from '../model/ConnectionOptions'
import { default as persistentStorage, StorageIdentifier } from '../PersistentStorage'
import { Dispatch } from 'redux'
import { showError } from './Global'
import { remote } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

import {
  ActionTypes,
  Action,
} from '../reducers/ConnectionManager'

const storedConnectionsIdentifier: StorageIdentifier<{[s: string]: ConnectionOptions}> = {
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

export const selectCertificate = (connectionId: string) => async (dispatch: Dispatch<any>, getState: () => AppState) => {
  try {
    const certificate = await openCertificate()
    console.log(certificate)
    dispatch(updateConnection(connectionId, {
      selfSignedCertificate: certificate,
    }))
  } catch (error) {
    console.log(error)
    dispatch(showError(error))
  }
}

async function openCertificate(): Promise<CertificateParameters> {
  const rejectReasons = {
    noCertificateSelected: 'No certificate selected',
    certificateSizeDoesNotMatch: 'Certificate size larger/smaller then expected.',
  }

  return new Promise((resolve, reject) => {
    remote.dialog.showOpenDialog({ properties: ['openFile'], securityScopedBookmarks: true }, (filePaths?: string[]) => {
      const selectedFile = filePaths && filePaths[0]
      if (!selectedFile) {
        reject(rejectReasons.noCertificateSelected)
        return
      }

      fs.readFile(selectedFile, (error, data) => {
        if (error) {
          reject(error)
          return
        }

        if (data.length > 16_384 || data.length < 128) {
          reject(rejectReasons.certificateSizeDoesNotMatch)
          return
        }

        resolve({
          data: data.toString('base64'),
          name: path.basename(selectedFile),
        })
      })
    })
  })
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

async function ensureConnectionsHaveBeenInitialized() {
  const connections = await persistentStorage.load(storedConnectionsIdentifier)
  const requiresInitialization = !connections
  if (requiresInitialization) {
    const migratedConnection = loadLegacyConnectionOptions()
    const defaultConnections = makeDefaultConnections()
    persistentStorage.store(storedConnectionsIdentifier, {
      ...migratedConnection,
      ...defaultConnections,
    })

    clearLegacyConnectionOptions()
  }
}
